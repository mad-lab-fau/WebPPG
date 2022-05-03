import { getCenterAreaStartCoordinate, averageArray } from './helpers';

class WebPPG {
  constructor () {

    console.log("web ppg constructed");

    /**
     *    var video = document.getElementById('original-video');
          var sourceCanvas = document.getElementById('source-canvas');
          var aoiCanvas = document.getElementById('aoi-canvas');
     */

    // Image capturing variables
    this.globalTrack;
    this.video;

    // 
    this.helperCanvas;
    this.aoiCanvas;

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
   * Torch on/off mainly for development purposes
   */
  torchOff() {
    this.globalTrack.applyConstraints({
        advanced: [{torch: false}]
    });
  }

  torchOn() {
    this.globalTrack.applyConstraints({
        advanced: [{torch: true}]
    });
  }

  /**
   * Get supported FPS of the active WebRTC track
   * @returns FPS or false if not supported
   */
  getFps() {
      let capabilities = this.globalTrack.getCapabilities();
      if ( capabilities ) {
          return capabilities.frameRate.max;
      }
      return false;
  }

  getVideoElement() {
    if (this.video) {
      return this.video;
    }
    else {
      return false;
    }
  }
  
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
   * @param {} videoElement DOM <video> element, e.g. previously acquired via document.selectElementById()
   * @returns 
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
  
    //console.log(navigator.mediaDevices.getSupportedConstraints());
  
    this.globalTrack = stream.getVideoTracks()[0];
      
    // console.log(this.globalTrack.getSettings());
      
    await this.globalTrack.applyConstraints({
        advanced: [{torch: true}]
    })
  }

  /**
   * PRE-PROCESSING
   * Video pre-processing functions
   */

  /**
   * Begin processing loop
   * For internal preprocesisng
   * WebRTC must be up and running beforehand
    */
       
  startPreprocessing(helperCanvas, aoiCanvas) {
    this.helperCanvas = helperCanvas;
    this.aoiCanvas = aoiCanvas;

    // start the first processing loop
    // setTimeout(this.timerCallback(this), 100);
    // setInterval(this.timerCallback, 30);
    // }, (1000/this.getFps()));
    setInterval(this.computeFrame, 1000/this.getFps(), this);
  }

  /**
   * Save recorded values with current timestamp
   * 
   * @param {*} redAverage Recorded value of the red channel
   * @param {*} greenAverage Recorded value of the green channel
   * @param {*} blueAverage Recorded value of the blue channel
   */

  addPPGDataRecord(redAverage, greenAverage, blueAverage) {
    this.timestamps.push(Date.now());
    this.rAvgs.push(redAverage);
    this.gAvgs.push(greenAverage);
    this.bAvgs.push(blueAverage);
  }

  computeFrame(self) {
    let helperCanvasContext = self.helperCanvas.getContext("2d");
    let aoiCanvasContext = self.aoiCanvas.getContext("2d");

    // Get the initial "raw" data into the canvas
    helperCanvasContext.drawImage(self.video, 0, 0, self.video.width, self.video.height);

    let xStartCoordinate = getCenterAreaStartCoordinate(self.video.width, self.aoiCanvas.width);
    let yStartCoordiante = getCenterAreaStartCoordinate(self.video.height, self.aoiCanvas.height);

    let frame = helperCanvasContext.getImageData(xStartCoordinate, yStartCoordiante, self.aoiCanvas.width, self.aoiCanvas.height); // Select AOI here

    aoiCanvasContext.putImageData(frame, 0, 0);
    
    // console.log(frame);
    let redArray = [];
    let greenArray = [];
    let blueArray = [];

    for (let i = 0; i < frame.data.length/4; i++) {
        redArray.push(frame.data[i * 4 + 0]);
        greenArray.push(frame.data[i * 4 + 1]);
        blueArray.push(frame.data[i * 4 + 2]);
    }

    self.addPPGDataRecord(averageArray(redArray), averageArray(greenArray), averageArray(blueArray));
  }

  /**
   * Time handler/agent
   * Executed in window.-context, thus requires "this/self" of WebPPG 
   * provided by parameter
   * EDIT: Probably no longer needed. This may however increase signal steadyness on the long run.
   * 
   * @param {} self "this" of the actual class
   */
  /*timerCallback(self) {
    // let begin = Date.now();
    self.computeFrame();
    console.log(self.getFps());
    // let delay = 1000/this.getFps() - (Date.now() - begin);
    // setTimeout(self.timerCallback(self), delay);

    // setTimeout(self.timerCallback(self), 1000/this.getFps());
   }*/
}

export default WebPPG;
