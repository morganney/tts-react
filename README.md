# [`tts-react`](https://www.npmjs.com/package/tts-react)

![CI](https://github.com/morganney/tts-react/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/tts-react/branch/main/graph/badge.svg?token=ZDP1VBC8E1)](https://codecov.io/gh/morganney/tts-react)
[![NPM version](https://img.shields.io/npm/v/tts-react.svg)](https://www.npmjs.com/package/tts-react)

<img src="./packages/tts-react/tts-react.png" alt="TextToSpeech React component" width="375" />

Repository for `tts-react`, a React component and hook that uses the [`SpeechSynthesis`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and [`SpeechSynthesisUtterance`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) API's to convert text to speech. You can fallback to the [`HTMLAudioElement`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) API by providing a `fetchAudioData` prop to the hook or component.

## Install

`npm i react react-dom tts-react`

## Table of Contents

* [tts-react](./packages/tts-react)
* [storybook](./packages/story)
* [examples](./docs/examples.md)

## Demo (Storybook)

[morganney.github.io/tts-react](https://morganney.github.io/tts-react/)

## Progress

* Helped fix a `SpeechSynthesisUtterance` default volume [Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1385117).
