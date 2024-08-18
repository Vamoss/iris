import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

class IrisDetector {
  private static myFaceLandmarker: FaceLandmarker | undefined;
  private static faceLandmarks: FaceLandmarkerResult | undefined;
  private static video: HTMLVideoElement;
  private static lastVideoTime = -1;
  private static running: boolean = false;
  private static initted: boolean = false;

  private static trackingConfig = {
    doAcquireFaceLandmarks: true,
    doAcquireFaceMetrics: true,
    poseModelLiteOrFull: 'full',
    maxNumFaces: 1,
  };

  private static async preload() {
    if(IrisDetector.initted) return;
    IrisDetector.initted = true;
    
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    if (IrisDetector.trackingConfig.doAcquireFaceLandmarks) {
      IrisDetector.myFaceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        numFaces: IrisDetector.trackingConfig.maxNumFaces,
        runningMode: "VIDEO",
        outputFaceBlendshapes: IrisDetector.trackingConfig.doAcquireFaceMetrics,
        outputFacialTransformationMatrixes: true,
        baseOptions: {
          delegate: "GPU",
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
      });
    }
  }

  private static async predictWebcam() {
    if(IrisDetector.running){
      let startTimeMs = performance.now();
      if (IrisDetector.lastVideoTime !== (IrisDetector.video?.currentTime || -1)) {
        if (IrisDetector.trackingConfig.doAcquireFaceLandmarks && IrisDetector.myFaceLandmarker) {
          IrisDetector.faceLandmarks = await IrisDetector.myFaceLandmarker.detectForVideo(IrisDetector.video, startTimeMs);
        }
        IrisDetector.lastVideoTime = IrisDetector.video?.currentTime || -1;
      }
      window.requestAnimationFrame(IrisDetector.predictWebcam);
    }
  }

  public static start(video: HTMLVideoElement) {
    if(IrisDetector.running) return;
    IrisDetector.running = true;
    IrisDetector.video = video;
    IrisDetector.preload().then(() => {
      IrisDetector.predictWebcam();
    });
  }

  public static stop() {
    if(!IrisDetector.running) return;
    IrisDetector.running = false;
    IrisDetector.lastVideoTime = -1;
  }

  public static update(): any {
    return IrisDetector.faceLandmarks;
  }
}

export default IrisDetector;