import cssValidator from "w3c-css-validator";

type ValidatorMessage = {
  type: "error" | "info" | "non-document-error";
  message: string;
  lastLine?: number;
  lastColumn?: number;
  firstLine?: number;
  firstColumn?: number;
  subType?: string;
  extract?: string;
  hiliteStart?: number;
  hiliteLength?: number;
};

type CheckResult = {
  status: number;
  messages: ValidatorMessage[];
};

export const throttle = () => {
  const throttleDelay = 1000;
  let nextExecution = Date.now();

  const runWithThrottle = async <T>(callback: () => T) => {
    const d = nextExecution;
    nextExecution = Date.now() + throttleDelay;

    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(callback());
      }, Math.max(0, d - Date.now()));
    });
  };

  return { runWithThrottle };
};

const validateHtmlText = async (text: string): Promise<CheckResult> => {
  let result: Response | undefined;

  try {
    result = await fetch("https://html5.validator.nu/?out=json", {
      method: "POST",
      body: text,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    });
  } finally {
    return {
      status: result?.status ?? 500,
      messages: (await result?.json()).messages ?? [],
    };
  }
};

const { runWithThrottle: runCssValidateWithThrottle } = throttle();

export const callCssValidator = async (text: string, filename: string) => {
  const data = await runCssValidateWithThrottle(() =>
    cssValidator.validateText(text, { warningLevel: 2 })
  );

  console.log(`(${data.valid ? "VALID" : "INVALID"}) ${filename}`);

  for (const msg of data.errors) {
    console.log(`- (error:${msg.line}): ${msg.message}`);
  }

  for (const msg of data.warnings) {
    console.log(`- (warning:${msg.line}): ${msg.message}`);
  }
};

const { runWithThrottle: runHtmlValidateWithThrottle } = throttle();

export const callHtmlValidator = async (text: string, filename: string) => {
  const data = await runHtmlValidateWithThrottle(() => validateHtmlText(text));
  const valid =
    data.status === 200 && data.messages.every((msg) => msg.type !== "error");

  console.log(`(${valid ? "VALID" : "INVALID"}) ${filename}`);

  for (const msg of data.messages) {
    if (msg.type === "non-document-error")
      throw new Error(`Error checking document <${filename}>: ${msg.message}`);

    console.log(`- (${msg.type}:${msg.lastLine}): ${msg.message}`);
  }
};
