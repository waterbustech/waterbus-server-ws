<div align="center">
<img src="https://github.com/waterbustech/waterbus/raw/main/assets/images/img_app_logo.png?raw=true" width="25%"/>
</div>

<h2 align="center">Waterbus Server API</h2>
<p align="center">This is the server API for Waterbus. It is responsible for interacting with the database and ensuring data consistency.</p>

<div class="badges" align="center">
<p><a href="https://codecov.io/gh/waterbustech/waterbus"><img src="https://codecov.io/gh/waterbustech/waterbus/branch/main/graph/badge.svg?token=7KEMH26LHZ" alt="codecov"></a><a href="https://www.codefactor.io/repository/github/waterbustech/waterbus"><img src="https://www.codefactor.io/repository/github/waterbustech/waterbus/badge" alt="CodeFactor"></a><img src="https://img.shields.io/github/actions/workflow/status/waterbustech/waterbus/ci.yml" alt="GitHub Workflow Status (with event)"><img src="https://img.shields.io/github/issues/waterbustech/waterbus" alt="GitHub issues"><a href="https://chromium.googlesource.com/external/webrtc/+/branch-heads/6099"><img src="https://img.shields.io/badge/libwebrtc-122.6261.01-yellow.svg" alt="libwebrtc"></a><img src="https://img.shields.io/cocoapods/v/KaiRTC" alt="Cocoapods Version"><a href="https://github.com/lambiengcode"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat&amp;logo=github" alt="PRs Welcome"></a></p>
</div>
<div align="center">
<a href="https://twitter.com/waterbustech"><img src="https://img.shields.io/twitter/follow/waterbus.tech?style=social" alt="Twitter Follow"></a><a href="https://discord.gg/mfrWVefU"><img alt="Discord" src="https://img.shields.io/discord/1220616225521143818"></a>
</div>
<p align="center">
  <a href="https://docs.waterbus.tech">Website</a> &bull;
  <a href="https://github.com/waterbustech/waterbus/wiki">Wiki</a> &bull;
  <a href="https://github.com/waterbustech/waterbus/blob/main/LICENSE">License</a>
</p>

> [!IMPORTANT]  
> Currently, Waterbus is an early release that is subject to the following limitations: it may have limited support, changes may not be compatible with other pre-general availability versions, and availability may change without notice.

## 👋 Introduction

- 🤙 Waterbus is open source video conferencing multiplatform app built on latest WebRTC SDK. This is server api for the application. 
- 🎯 Waterbus aims for scalability and low latency as well as self-hosted and offers many useful features for everyday interviews or meetings.

## 📦 Requirements

Before getting started, ensure you have the following software installed:

- `Node.js`: (>= 18)
- `NestJS CLI` (>= 9.1.7)
- `Redis`: (>= 7.0.12)

## ✨ Todo

- [x] Meetings
  - [x] Publish/Subscribe
  - [x] On/off camera, microphone
  - [x] Screen sharing
  - [x] Multiple codecs
  - [x] Emit to others new participant
  - [x] Edit to others participant has left
- [x] Chats
  - [x] Send message
  - [x] Edit message
  - [x] Delete message

## 🚀 Quick run

- Clone the repository

```sh
git clone https://github.com/waterbustech/waterbus-server-ws.git
cd waterbus-server-ws/
```

- Create .env file

```sh
cp env-example .env
```

- Install dependencies

```sh
yarn
```

- Start server

```sh
yarn start
```

## 💙 Supports

Support it by joining [stargazers](https://github.com/waterbustech/waterbus-server-api/stargazers) for this repository. ⭐

Also, follow [maintainers](https://github.com/lambiengcode) on GitHub for our next creations!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you encounter any problems or have suggestions for improvements.

## 🔗 Links

- 📢 [waterbus.netlify.app](http://waterbus.netlify.app/): Home page to introduce products and features.
- 🌍 [meet.waterbus.tech](http://meet.waterbus.tech/): Web version of `waterbus` with features for online meetings
- 📖 [Documentation](http://docs.waterbus.tech/): for developers.
- 👷 [Server Design](https://docs.waterbus.tech/server/design): ERD, Architecture and SFU
- 🛠️ [API Documentation](https://docs.waterbus.tech/server/api): OpenAPI

## License

Distributed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## 📧 Contact Information

If you have any questions or suggestions related to this application, please contact me via email: `lambiengcode@gmail.com`.

Built with 💙 by the Waterbus team.
