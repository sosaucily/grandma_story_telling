// Cute cartoon avatar drawings for Eli and Grandma using Canvas 2D

export function drawEli(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const cx = 180, cy = 180;

  // Background circle
  ctx.beginPath();
  ctx.arc(cx, cy, 170, 0, Math.PI * 2);
  ctx.fillStyle = '#e3f2fd';
  ctx.fill();

  // Body / shirt (blue)
  ctx.beginPath();
  ctx.ellipse(cx, 330, 100, 70, 0, Math.PI, 0);
  ctx.fillStyle = '#64b5f6';
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.fillStyle = '#fce4c7';
  ctx.fillRect(160, 240, 40, 30);

  // Head
  ctx.beginPath();
  ctx.arc(cx, 170, 85, 0, Math.PI * 2);
  ctx.fillStyle = '#fce4c7';
  ctx.fill();

  // Hair (brown, messy toddler hair)
  ctx.fillStyle = '#6d4c41';
  ctx.beginPath();
  ctx.ellipse(cx, 105, 88, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair tufts
  ctx.beginPath();
  ctx.ellipse(130, 95, 30, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(220, 100, 25, 18, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(175, 85, 28, 16, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (big blue eyes)
  // Left eye white
  ctx.beginPath();
  ctx.ellipse(152, 175, 20, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  // Left eye iris
  ctx.beginPath();
  ctx.arc(154, 178, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#42a5f5';
  ctx.fill();
  // Left eye pupil
  ctx.beginPath();
  ctx.arc(155, 179, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1a237e';
  ctx.fill();
  // Left eye sparkle
  ctx.beginPath();
  ctx.arc(150, 174, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Right eye white
  ctx.beginPath();
  ctx.ellipse(208, 175, 20, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  // Right eye iris
  ctx.beginPath();
  ctx.arc(210, 178, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#42a5f5';
  ctx.fill();
  // Right eye pupil
  ctx.beginPath();
  ctx.arc(211, 179, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1a237e';
  ctx.fill();
  // Right eye sparkle
  ctx.beginPath();
  ctx.arc(207, 174, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(136, 152);
  ctx.quadraticCurveTo(152, 144, 168, 152);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(192, 152);
  ctx.quadraticCurveTo(208, 144, 224, 152);
  ctx.stroke();

  // Nose
  ctx.beginPath();
  ctx.arc(180, 200, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#f0c9a6';
  ctx.fill();

  // Mouth (big smile)
  ctx.beginPath();
  ctx.moveTo(155, 220);
  ctx.quadraticCurveTo(180, 248, 205, 220);
  ctx.strokeStyle = '#c47a5a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cheeks (rosy)
  ctx.beginPath();
  ctx.arc(130, 210, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 138, 128, 0.3)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(230, 210, 15, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(92, 180, 15, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fce4c7';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(268, 180, 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGrandma(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const cx = 180, cy = 180;

  // Background circle
  ctx.beginPath();
  ctx.arc(cx, cy, 170, 0, Math.PI * 2);
  ctx.fillStyle = '#fce4ec';
  ctx.fill();

  // Body / blouse (warm burgundy)
  ctx.beginPath();
  ctx.ellipse(cx, 330, 105, 70, 0, Math.PI, 0);
  ctx.fillStyle = '#c2185b';
  ctx.fill();

  // Necklace
  ctx.beginPath();
  ctx.arc(cx, 275, 30, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Neck
  ctx.beginPath();
  ctx.fillStyle = '#e8c9a0';
  ctx.fillRect(160, 240, 40, 30);

  // Head
  ctx.beginPath();
  ctx.arc(cx, 170, 85, 0, Math.PI * 2);
  ctx.fillStyle = '#e8c9a0';
  ctx.fill();

  // Hair (dark, styled up)
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.ellipse(cx, 100, 90, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair sides
  ctx.beginPath();
  ctx.ellipse(100, 140, 30, 50, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(260, 140, 30, 50, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Hair bun/top
  ctx.beginPath();
  ctx.ellipse(cx, 78, 45, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Grey streaks
  ctx.strokeStyle = '#9e9e9e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 95);
  ctx.quadraticCurveTo(160, 75, 180, 80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(200, 85);
  ctx.quadraticCurveTo(220, 75, 235, 95);
  ctx.stroke();

  // Eyes (warm brown)
  // Left eye white
  ctx.beginPath();
  ctx.ellipse(152, 175, 18, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  // Left eye iris
  ctx.beginPath();
  ctx.arc(154, 178, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#6d4c41';
  ctx.fill();
  // Left eye pupil
  ctx.beginPath();
  ctx.arc(155, 179, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#1b0000';
  ctx.fill();
  // Left eye sparkle
  ctx.beginPath();
  ctx.arc(151, 175, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Right eye white
  ctx.beginPath();
  ctx.ellipse(208, 175, 18, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  // Right eye iris
  ctx.beginPath();
  ctx.arc(210, 178, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#6d4c41';
  ctx.fill();
  // Right eye pupil
  ctx.beginPath();
  ctx.arc(211, 179, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#1b0000';
  ctx.fill();
  // Right eye sparkle
  ctx.beginPath();
  ctx.arc(207, 175, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Eyebrows (thinner, elegant)
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(136, 155);
  ctx.quadraticCurveTo(152, 148, 168, 155);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(192, 155);
  ctx.quadraticCurveTo(208, 148, 224, 155);
  ctx.stroke();

  // Crow's feet (gentle laugh lines)
  ctx.strokeStyle = 'rgba(139, 90, 60, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(125, 178);
  ctx.lineTo(118, 172);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(125, 182);
  ctx.lineTo(117, 182);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(235, 178);
  ctx.lineTo(242, 172);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(235, 182);
  ctx.lineTo(243, 182);
  ctx.stroke();

  // Nose
  ctx.beginPath();
  ctx.arc(180, 200, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#d4a88a';
  ctx.fill();

  // Mouth (warm smile)
  ctx.beginPath();
  ctx.moveTo(152, 222);
  ctx.quadraticCurveTo(180, 250, 208, 222);
  ctx.strokeStyle = '#b5675a';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Lip color
  ctx.beginPath();
  ctx.moveTo(155, 222);
  ctx.quadraticCurveTo(180, 242, 205, 222);
  ctx.quadraticCurveTo(180, 230, 155, 222);
  ctx.fillStyle = 'rgba(211, 47, 47, 0.25)';
  ctx.fill();

  // Cheeks (warm rosy)
  ctx.beginPath();
  ctx.arc(128, 210, 16, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(240, 98, 146, 0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(232, 210, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(92, 180, 14, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e8c9a0';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(268, 180, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Earrings
  ctx.beginPath();
  ctx.arc(92, 200, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd54f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(268, 200, 5, 0, Math.PI * 2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 2.5;
  // Left lens
  ctx.beginPath();
  ctx.ellipse(152, 175, 25, 23, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Right lens
  ctx.beginPath();
  ctx.ellipse(208, 175, 25, 23, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(177, 175);
  ctx.lineTo(183, 175);
  ctx.stroke();
  // Temple arms
  ctx.beginPath();
  ctx.moveTo(127, 172);
  ctx.lineTo(105, 168);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(233, 172);
  ctx.lineTo(255, 168);
  ctx.stroke();
}
