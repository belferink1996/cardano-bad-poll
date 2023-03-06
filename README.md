# Bad Poll

### Developed by Bad Fox Motorcycle Club

A web3 tool designed to make governance on Cardano easy and accessible to everyone!

[poll.badfoxmc.com](https://poll.badfoxmc.com)

# SDK for websites

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Your metadata -->
  </head>
  <script src="https://poll.badfoxmc.com/sdk.min.js"></script>
  <body>
    <!-- Your website -->
  </body>
</html>
```

```js
const badPoll = new BadPollSDK()

badPoll.start({
  creatorStakeKey: 'stake1...',
  voterStakeKey: 'stake1...',
})

badPoll.stop()
```
