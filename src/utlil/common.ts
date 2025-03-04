export const cliExitController = new AbortController();

export const handleExit = () => {
  cliExitController.abort();
  process.exit(0);
};
