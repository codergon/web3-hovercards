<div align="center">
    <h1 style="padding-bottom: 16px"><img align="center" src="./src/static/icons/icon128.png" style="border-radius: 4px; height: 50px; margin-right: 10px;" />
    Web3-hovercards
    </h1>
</div>

Web3-hovercards is a Chrome extension that displays relevant information about Ethereum addresses and ENS names in a user-friendly hovercard modal. It provides valuable insights, including transaction count, balance(in Ether and USD), associated ENS names, and NFTs, enhancing your browsing experience.

## Usage

Once the extension is installed, it will automatically activate when browsing web pages. To make use of its features:

1. Hover your mouse over an Ethereum address or ENS name on any web page.
2. A modal hovercard will appear, presenting you with pertinent information about the address or name.
3. Explore the provided details, including the address type, balance, NFTs and more.

## Installation

To install Web3-hovercards:

- Go to the [Chrome Web Store](https://chrome.google.com/webstore) and search for "Web3 Hovercards" or visit the [Web3 Hovercards page](https://chrome.google.com/webstore/detail/mlanaepdepnhnmboakpiicbbfobjkojp) directly. To setup the extension locally, please follow the instructions [below](#local-setup)

## Local setup

To setup the extension locally:

1. Clone this repository to your local machine.
2. Install the dependencies by running npm install or yarn install.
3. Start the development server with npm start or yarn start.
4. Open your Chrome browser, go to chrome://extensions, enable Developer Mode, and click on "Load unpacked." Select the build folder in the cloned repository.

> **Note:** You need to supply your own [Infura](https://infura.io/) API key in the `src/contentScript/constants/infura.ts` file. You can obtain a free API key by signing up [here](https://app.infura.io/register).

## Feedback and Contributions

Your feedback and contributions are valuable in making Web3-hovercards better. If you'd like to contribute, please fork the repository and submit a pull request with your proposed changes.
