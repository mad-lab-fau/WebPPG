import { getCenterAreaStartCoordinate, averageArray, inverseArray } from './helpers';

class WebPPG {
  constructor() {

    console.log("WebPPG constructed.");

    // Image capturing variables
    this.globalTrack;
    this.video;

    this.helperCanvas;
    this.aoiCanvas;
    this.internalInterval;

    this.timestamps = [];
    this.rAvgs = [];
    this.gAvgs = [];
    this.bAvgs = [];
  }

  /**
   * SIGNAL ACQUISITION / IMAGE ACQUISITION / CAMERA CONTROL
   * General video capture functions
   * Powered by WebRTC
   */

  /**
   * Torch the torch off
   */
  async torchOff() {
    await this.globalTrack.applyConstraints({
      advanced: [{ torch: false }]
    });
  }

  /**
   * Turn the torch on
   */
  async torchOn() {
    await this.globalTrack.applyConstraints({
      advanced: [{ torch: true }]
    });
  }

  /**
   * Get supported FPS of the active WebRTC track
   * @returns FPS or false if not supported
   */
  getFps() {
    let capabilities = this.globalTrack.getCapabilities();
    if (capabilities) {
      return capabilities.frameRate.max;
    }
    return false;
  }

  /**
   * 
   * @returns The DOM video element
   */
  getVideoElement() {
    if (this.video) {
      return this.video;
    }
    else {
      return false;
    }
  }

  /**
   * 
   * @returns The AOI canvas DOM element
   */
  getAoiCanvasElement() {
    if (this.aoiCanvas) {
      return this.aoiCanvas;
    }
    else {
      return false;
    }
  }

  /**
   * Start processing of the WebRTC video stream.
   * Will prompt the user to allow camera usage.
   * Requires a <video autplay />-DOM element to function.
   * Note that the width and height of this <video />-element MUST be set, as it is
   * used as the raw input resolution and also in the WebRTC getUserMedia request.
   * 
   * @param {DOM <video> element} videoElement e.g. previously acquired via document.selectElementById()
   */
  async startWebRTC(videoElement) {
    this.video = videoElement;

    let stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        frameRate: {
          ideal: 240
        },
        height: {
          ideal: this.video.height
        },
        width: {
          ideal: this.video.width
        },
        torch: true,
      }
    })

    videoElement.srcObject = stream;

    this.globalTrack = stream.getVideoTracks()[0];

    await this.torchOn();
  }

  /**
   * PRE-PROCESSING
   * Video pre-processing functions
   */

  /**
   * Begin processing loop
   * For internal preprocessing
   * WebRTC must be up and running beforehand
   * @param {DOMElement} helperCanvas 
   * @param {DOMElement} aoiCanvas 
   */
  startRecording(helperCanvas, aoiCanvas) {
    this.helperCanvas = helperCanvas;
    this.aoiCanvas = aoiCanvas;

    this.internalInterval = setInterval(this.computeFrame, 1000 / this.getFps(), this);
  }

  /**
   * Stops the recording
   */
  stopRecording() {
    if (this.internalInterval === undefined) {
      throw new Error("Recording was not started.")
    }
    clearInterval(this.internalInterval);
    this.torchOff();
  }

  /**
   * Save recorded values with current timestamp
   * 
   * @param {Number} redAverage Recorded average value of the red channel
   * @param {Number} greenAverage Recorded average value of the green channel
   * @param {Number} blueAverage Recorded average value of the blue channel
   */
  addPPGDataRecord(redAverage, greenAverage, blueAverage) {
    this.timestamps.push(Date.now());
    this.rAvgs.push(redAverage);
    this.gAvgs.push(greenAverage);
    this.bAvgs.push(blueAverage);
  }

  /**
   * Internal processing loop
   * Called every frame
   * @param {} self 
   */
  computeFrame(self) {
    let helperCanvasContext = self.helperCanvas.getContext("2d");
    let aoiCanvasContext = self.aoiCanvas.getContext("2d");

    // Get the initial "raw" data into the canvas
    helperCanvasContext.drawImage(self.video, 0, 0, self.video.width, self.video.height);

    let xStartCoordinate = getCenterAreaStartCoordinate(self.video.width, self.aoiCanvas.width);
    let yStartCoordiante = getCenterAreaStartCoordinate(self.video.height, self.aoiCanvas.height);

    let frame = helperCanvasContext.getImageData(xStartCoordinate, yStartCoordiante, self.aoiCanvas.width, self.aoiCanvas.height); // Select AOI here

    aoiCanvasContext.putImageData(frame, 0, 0);

    let redArray = [];
    let greenArray = [];
    let blueArray = [];

    for (let i = 0; i < frame.data.length / 4; i++) {
      redArray.push(frame.data[i * 4 + 0]);
      greenArray.push(frame.data[i * 4 + 1]);
      blueArray.push(frame.data[i * 4 + 2]);
    }

    // Note: Using the "inverseArray" function before storing values can help to increase (float) precision.
    // This way, values are "around 0" instead of "around 255", where precision is higher.
    // This however depends on the specific channel and smartphone model, and requires further investigation.
    self.addPPGDataRecord(averageArray(redArray, 255), averageArray(greenArray, 255), averageArray(blueArray, 255));
  }

  /**
   * Get currently stored data
   * @returns object Currently stored (recorded) PPG data
   */
  getData() {
    return { times: this.timestamps, red: this.rAvgs, green: this.gAvgs, blue: this.bAvgs }
  }
}

export default WebPPG;
