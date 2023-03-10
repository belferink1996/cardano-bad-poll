# Bad Poll

### Developed by Bad Fox Motorcycle Club

A web3 tool designed to make governance on Cardano easy and accessible to everyone!

[poll.badfoxmc.com](https://poll.badfoxmc.com)

# SDK for websites

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://poll.badfoxmc.com/sdk.min.js"></script>
    <script>
      const badPoll = new BadPollSDK({ creatorStakeKey: 'stake1...' })
    </script>
  </head>

  <body>
    <div style="position: relative;">
      <button
        onclick="badPoll.loadWallets({ injectId: 'inject-wallets', buttonBackgroundColor: '#fff', buttonTextColor: '#000' })"
      >
        Governance
      </button>

      <div
        id="inject-wallets"
        style="position: absolute; top: 100%; right: 0; display: flex; flex-direction: column;"
      >
        <!-- Wallets will be injected here -->
      </div>
    </div>

    <!-- Website... -->
  </body>
</html>
```
