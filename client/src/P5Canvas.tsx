import React, { useRef, useEffect } from 'react';
import { FaceLandmarker, FaceLandmarkerResult, Matrix } from '@mediapipe/tasks-vision';
import p5 from 'p5';
import IrisDetector from './IrisDetector';

const P5Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(document.createElement('div'));
  
    //from 0.1 to 1
    const leftSensitivity = 0.5;
    const rightSensitivity = 0.4;
    const upSensitivity = 0.15;
    const downSensitivity = 0.3;

  useEffect(() => {
    let video: p5.Element;
    
    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent(containerRef.current);
        video = p.createCapture("video");
        video.size(320, 240);
        video.hide();
        IrisDetector.start(video.elt);
      };

      p.draw = () => {
        p.background(255);
        const faceLandmarks:FaceLandmarkerResult | undefined = IrisDetector.update();
        
        // Draw the video background
        p.push();
            p.translate(p.width, 0);
            p.scale(-1, 1);
            p.tint(255, 255, 255, 72);
            p.image(video, 0, 0, p.width, p.height);
            p.tint(255);
        p.pop();

        // Draw diagnostic info
        p.noStroke();
        p.fill("black");
        p.textSize(12);
        p.text("FPS: " + Math.round(p.frameRate()), 40, 30);

        // Draw face points
        if (faceLandmarks && faceLandmarks.faceLandmarks) {
          const nFaces = faceLandmarks.faceLandmarks.length;
          for (let f = 0; f < nFaces; f++) {
            const aFace = faceLandmarks.faceLandmarks[f];
            if (aFace) {
              const nFaceLandmarks = aFace.length;
              p.noFill();
              p.stroke("black");
              p.strokeWeight(1.0);
              for (let i = 0; i < nFaceLandmarks; i++) {
                const px = p.map(aFace[i].x, 0, 1, p.width, 0);
                const py = p.map(aFace[i].y, 0, 1, 0, p.height);
                p.circle(px, py, 1);
              }
              p.noFill();
              p.stroke("black");
              p.strokeWeight(2.0);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_LIPS);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS);
              drawConnectors(p, aFace, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS);
            }

            let aFaceMetrics = faceLandmarks.faceBlendshapes[f];
            //down
            const eyeLookDownLeft = aFaceMetrics.categories[11].score;
            const eyeLookDownRight = aFaceMetrics.categories[12].score;
            //up
            const eyeLookUpLeft = aFaceMetrics.categories[17].score;
            const eyeLookUpRight = aFaceMetrics.categories[18].score;
            //left
            const eyeLookOutLeft = aFaceMetrics.categories[15].score;
            const eyeLookInRight = aFaceMetrics.categories[14].score;
            //right
            const eyeLookInLeft = aFaceMetrics.categories[13].score;
            const eyeLookOutRight = aFaceMetrics.categories[16].score;
            
            const up = Math.max(eyeLookUpLeft, eyeLookUpRight);
            const down = Math.max(eyeLookDownLeft, eyeLookDownRight);
            const right = Math.max(eyeLookInLeft, eyeLookOutRight);
            const left = Math.max(eyeLookOutLeft, eyeLookInRight);
            
            var x = p.width/2;
            var y = p.height/2;
            
            
            if(left > right){
                x = p.map(left, 0, leftSensitivity, p.width/2, 0);
            }else{
                x = p.map(right, 0, rightSensitivity, p.width/2, p.width);
            }
            
            if(up > down){
                y = p.map(up, 0, upSensitivity, p.height/2, 0);
            }else{
                y = p.map(down, 0, downSensitivity, p.height/2, p.height);
            }
            
            const orientation = getFaceOrientation(faceLandmarks.facialTransformationMatrixes[f]);
            // 0.6 so vai ate a metade - facing left
            // -0.6 so começa a partir da metade - facing right
            // 0.25 so vai ate a metade - facing down
            // -0.25 so começa a partir da metade - facing up
            // console.log(orientation.pitch);
            const faceOrientationX = p.map(orientation.pitch, 0.6, -0.6, -p.width, p.width);
            const faceOrientationY = p.map(orientation.roll, 0.25, -0.25, p.height, -p.height);
            x += faceOrientationX;
            y += faceOrientationY;
            
            const circleSize = 80;
            x = p.constrain(x, circleSize, p.width-circleSize);
            y = p.constrain(y, circleSize, p.height-circleSize);
            
            p.circle(x, y, circleSize);

            // Draw debug bars
            drawDebugBar(p, left, right, up, down); // You need to define these variables or calculations
        }
      }
        
        // Draw the face metrics if available
        if (faceLandmarks && faceLandmarks.faceBlendshapes) {
          const nFaces = faceLandmarks.faceLandmarks.length;
          for (let f = 0; f < nFaces; f++) {
            const aFaceMetrics = faceLandmarks.faceBlendshapes[f];
            if (aFaceMetrics) {
              p.fill('black');
              p.textSize(7);
              const tx = 40;
              let ty = 40;
              const dy = 8.5;
              const vx0 = tx - 5;
              const vx1 = tx - 35;

              const nMetrics = aFaceMetrics.categories.length;
              for (let i = 1; i < nMetrics; i++) {
                const metricName = aFaceMetrics.categories[i].categoryName;
                p.noStroke();
                p.text(metricName, tx, ty);

                const metricValue = aFaceMetrics.categories[i].score;
                const vx = p.map(metricValue, 0, 1, vx0, vx1);
                p.stroke(0, 0, 0);
                p.strokeWeight(2.0);
                p.line(vx0, ty - 2, vx, ty - 2);
                p.stroke(0, 0, 0, 20);
                p.line(vx0, ty - 2, vx1, ty - 2);
                ty += dy;
              }
            }
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const getFaceOrientation = (transformationMatrix:Matrix) => {
        // Assuming transformationMatrix is a 4x4 matrix from MediaPipe
      const m = transformationMatrix.data;
    
      // Extract rotation angles (yaw, pitch, roll) from the transformation matrix
      const yaw = Math.atan2(m[1], m[0]);
      const pitch = Math.asin(-m[2]);
      const roll = Math.atan2(m[6], m[10]);
    
      return { yaw, pitch, roll };
    }

    const drawConnectors = (p: p5, landmarks:any, connectorSet:any) => {
      if (landmarks) {
        const nConnectors = connectorSet.length;
        for (let i = 0; i < nConnectors; i++) {
          const index0 = connectorSet[i].start;
          const index1 = connectorSet[i].end;
          const x0 = p.map(landmarks[index0].x, 0, 1, p.width, 0);
          const y0 = p.map(landmarks[index0].y, 0, 1, 0, p.height);
          const x1 = p.map(landmarks[index1].x, 0, 1, p.width, 0);
          const y1 = p.map(landmarks[index1].y, 0, 1, 0, p.height);
          p.line(x0, y0, x1, y1);
        }
      }
    };

    const drawDebugBar = (p: p5, left:number, right:number, up:number, down:number) => {
      const barWidth = 200;
      const barHeight = 30;
      const border = 30;
      p.fill(255, 255, 0);
      p.noStroke();
      let w = left * barWidth;
      p.rect(p.width/2 - barWidth - border + barWidth - w, border, w, barHeight);
      w = right * barWidth;
      p.rect(p.width/2 + border, border, w, barHeight);
      
      w = up * barWidth;
      p.rect(p.width/2 - barWidth - border + barWidth - w, border * 4, w, barHeight);
      w = down * barWidth;
      p.rect(p.width/2 + border, border * 4, w, barHeight);

      p.noFill();
      p.stroke(0, 0, left > right ? 255 : 120);
      p.rect(p.width/2 - barWidth - border, border, barWidth, barHeight);
      p.stroke(0, 0, left <= right ? 255 : 120);
      p.rect(p.width/2 + border, border, barWidth, barHeight);
      
      p.stroke(0, 0, up > down ? 255 : 120);
      p.rect(p.width/2 - barWidth - border, border * 4, barWidth, barHeight);
      p.stroke(0, 0, up <= down ? 255 : 120);
      p.rect(p.width/2 + border, border * 4, barWidth, barHeight);

      p.noStroke();
      p.fill(0);
      p.textSize(30);
      p.text("LEFT: " + left.toFixed(2), p.width/2 - barWidth - border, barHeight + border + 40);
      p.text("RIGHT: " + right.toFixed(2), p.width/2 + border, barHeight + border + 40);
      p.text("UP: " + up.toFixed(2), p.width/2 - barWidth - border, barHeight + border * 4 + 40);
      p.text("DOWN: " + down.toFixed(2), p.width/2 + border, barHeight + border * 4 + 40);
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div ref={containerRef} />
  );
};

export default P5Canvas;
