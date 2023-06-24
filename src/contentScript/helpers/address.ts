const fixURL = (url: string) => {
  return url.includes("ipfs://")
    ? "https://ipfs.io/ipfs/" + url.split("ipfs://")[1]
    : url;
};

export { fixURL };
