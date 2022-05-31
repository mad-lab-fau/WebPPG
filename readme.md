# WebPPG: Web, Browser-Based Smartphone Photoplethysmography

## Introduction

WebPPG aims to enable web-based Photoplethysmography (PPG) recordings. It uses the WebRTC API/standard (Web Real-Time Communication) for video access. All video and signal extraction computations are performed on the user's end device. Thus, no video is permanently stored, promoting user privacy.

## Supported devices

Unfortunately, WebRTC browser support is limited as of now. The main bottleneck is the activation of the flash light/torch. 

Based on our experiments, this is unfortunately currently only supported in Chrome on Android. Firefox on Android reports the flash light as supported, but the flash light does not turn on. Safari does not allow access to the Smartphone's flash/torch, and reports it as not supported.

## Installation
Download the JavaScript library and helpers.js file. Place them in the same folder.

A npm package will follow at a later point in time.

## Usage

Include the library in your HTML header element
```
<header>
...
<script src="folder/WebPPG.js"></script>
...
</header>
```

<!-- As soon as npm package is available: You can also import WebPPG:
```
import WebPPG from 'WebPPG';
```-->

Initialize the class
```
const webPpg = new WebPPG()
```

Create a `<video autoplay>` element somewhere in your DOM (Document Object Model).
```
<video id="camera" autoplay width="128" height="128">
    </video>
```

Provide the video element to the WebPPG library, and initialize WebRTC.
The library will throw errors if the user did not allow the camera access prompt, or if the browser does not support turning the torch on.
Note that Firefox does not throw an error in this case, but the flash light simply will not turn on.
```  
let videoElement = document.getElementById("camera");
  try{
    await webPpg.startWebRTC(videoElement);
  }
  catch(e) {
    if(e.name === "NotAllowedError") {
        // User did not permit camera access
      return;
    }
    else if(e.name === "NotSupportedError") {
        // Flash light is not supported
    }
  }
  // Continue code - everything should work as expected
```
Afterwards, you should add an additional prompt in your application to ensure that the flash is actually on (as Firefox will not report it as unsupported).

Provide two additional HTML elements: 
- helperCanvas: Used internally. Should have the same size as the `<video>` DOM element 
- aoiCanvas: "Area of interest". WebPPG will extract a part of the original video, and only calculate the average color channels on this AOI. 
Neither of the elements have to be visible to the user.

```
<canvas width="128" height="128" id="helperCanvas" style="display: none;"></canvas>
<canvas width="16" height="16" id="aoiCanvas" style="display: none;"></canvas>
```
In the above case, the red/green/blue color channels will only be averaged on a 16x16 pixel area in the center of the original 128 pixel video.

Instruct the user to place their finger on the smartphone camera and flash. 
It can help to show the camera image, as modern smartphones may have more than one rear camera. The camera image "usually" is completely red if the finger is placed on the camera, as the skin is illuminated. On some smartphones, this may differ however, and can also be e.g. blue.
Note that depending on the Smartphone model, the flash can get very hot. Care for your user's safety, and explicitely remind them that they should stop the recording (or lift their finger) if the flash gets too hot.

Start the actual PPG signal recording.
```
webPpg.startWebRTC(video);
```

It may help to show a countdown meanwhile.

Stop the recording.
```
webPpg.stopRecording();
```

Get the recorded data, i.e. timestamps and average red/green/blue values.
```
let recordedData = webPpg.getData()
```

## Technical Details

As stated before, the main bottlenack is the activation of the user's smartphone flash/torch. 
This is done by applying a constraint to the respective mediaTrack as follows. 
It appears that only Chrome on Android supports this constraint as of now.

```
await this.globalTrack.applyConstraints({
    advanced: [{ torch: true }] 
});
```

<!--## Citation

Citation information will be added when/if paper is published.-->
