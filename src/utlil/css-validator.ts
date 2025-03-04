import { cliExitController } from "./common.js";

type CSSValidation = {
  uri: string;
  checkedby: string;
  csslevel: string;
  date: string;
  timestamp: string;
  validity: boolean;
  result: {
    errorcount: number;
    warningcount: number;
  };
  errors?: Array<{
    source: string;
    line: number;
    context: string;
    type: string;
    message: string;
  }>;
  warnings?: Array<{
    source: string;
    line: number;
    message: string;
    type: string;
    level: number;
  }>;
};

const WARNING_LVL: 0 | 1 | 2 | 3 = 1;
const USERMEDIUM:
  | "all"
  | "braille"
  | "embossed"
  | "handheld"
  | "print"
  | "projection"
  | "screen"
  | "speech"
  | "tty"
  | "tv" = "all";
const PROFILE:
  | "none"
  | "css1"
  | "css2"
  | "css21"
  | "css3"
  | "css3svg"
  | "svg"
  | "svgbasic"
  | "svgtiny"
  | "mobile"
  | "atsc-tv"
  | "tv" = "css3svg";

// Expected length of a boundary
const boundaryLength = 34;

// Helper function that produces a boundary for form data
const getBoundary = (): string => {
  const allowedChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let randomBoundaryPiece = "";

  for (let i = 0; i < 10; i += 1) {
    randomBoundaryPiece +=
      allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }

  return `----CSSValidatorBoundary${randomBoundaryPiece}`;
};

// Function that builds multipart/form-data for the specific parameters we pass to the W3C Validator API
// Based on this standard -> https://datatracker.ietf.org/doc/html/rfc7578
const buildFormData = (text: string): string => {
  const CRLF = "\r\n";
  const boundary = `--${getBoundary()}`;

  const pieces: string[] = [
    `Content-Disposition: form-data; name="text"${CRLF}${CRLF}${text}${CRLF}`,
    `Content-Disposition: form-data; name="profile"${CRLF}${CRLF}${PROFILE}${CRLF}`,
    `Content-Disposition: form-data; name="output"${CRLF}${CRLF}application/json${CRLF}`,
    `Content-Disposition: form-data; name="usermedium"${CRLF}${CRLF}${USERMEDIUM}${CRLF}`,
    `Content-Disposition: form-data; name="warning"${CRLF}${CRLF}${WARNING_LVL}${CRLF}`,
  ];

  return `${boundary}${CRLF}${pieces.join(`${boundary}${CRLF}`)}${boundary}`;
};

export const validateCssText = async (text: string): Promise<CSSValidation> => {
  const parameters = buildFormData(text);

  const resp = await fetch("https://jigsaw.w3.org/css-validator/validator", {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${parameters.slice(
        2,
        boundaryLength + 2
      )}`,
      "Content-Length": String(new TextEncoder().encode(parameters).byteLength),
    },
    body: parameters,
    signal: cliExitController.signal,
  });

  return (await resp.json()).cssvalidation;
};
