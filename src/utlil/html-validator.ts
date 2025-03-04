import { cliExitController } from "./common.js";

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

export const validateHtmlText = async (text: string): Promise<CheckResult> => {
  let result: Response | undefined;

  try {
    result = await fetch("https://html5.validator.nu/?out=json", {
      method: "POST",
      body: text,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
      signal: cliExitController.signal,
    });
  } finally {
    return {
      status: result?.status ?? 500,
      messages: (await result?.json())?.messages ?? [],
    };
  }
};
