/* End-position figures for Form Coach: schematic stick figures drawn from joint angles.
   Angles are degrees, 0 = forward (right), 90 = up. Lengths are in SVG units; the floor is y=142.
   These are drawings of the end position, not photographs, and not a substitute for a PT's eye. */
(function(){
  "use strict";
  var F=142, L={torso:34,thigh:27,shin:27,ua:21,fa:19,neck:5,head:8,foot:9};
  function P(o,a,l){var r=a*Math.PI/180;return [o[0]+l*Math.cos(r),o[1]-l*Math.sin(r)];}
  function seg(a,b,cls){return '<line class="'+(cls||"body")+'" x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'"/>';}
  function circ(c,r,cls){return '<circle class="'+cls+'" cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="'+r+'"/>';}

  // Side view: one visible side; a second limb marked far:true is drawn lighter.
  function side(o){
    var hip=o.hip, sh=P(hip,o.torso,L.torso), head=P(sh,o.head!=null?o.head:o.torso,L.neck+L.head), out="", pts={hip:hip,sh:sh,head:head,wr:[],an:[],el:[],kn:[]};
    (o.legs||[]).forEach(function(g){var cls=g.far?"body far":"body", kn=P(hip,g.t,L.thigh), an=P(kn,g.s,L.shin), ft=P(an,g.f!=null?g.f:0,L.foot); out+=seg(hip,kn,cls)+seg(kn,an,cls)+seg(an,ft,cls); pts.kn.push(kn); pts.an.push(an);});
    out+=seg(hip,sh,"body")+circ(head,L.head,"body");
    (o.arms||[]).forEach(function(a){var cls=a.far?"body far":"body", el=P(sh,a.u,L.ua), wr=P(el,a.f,L.fa); out+=seg(sh,el,cls)+seg(el,wr,cls); pts.el.push(el); pts.wr.push(wr);});
    return {svg:out,pts:pts};
  }
  // Front view: trunk line plus shoulder and hip bars; arms[0]/legs[0] are the figure's right (viewer's left).
  function front(o){
    var hip=o.hip, sh=[hip[0],hip[1]-L.torso], head=[sh[0],sh[1]-L.neck-L.head], out="", pts={hip:hip,sh:sh,head:head,wr:[],an:[],el:[],kn:[]};
    var hips=[[hip[0]-8,hip[1]],[hip[0]+8,hip[1]]], shs=[[sh[0]-13,sh[1]],[sh[0]+13,sh[1]]];
    out+=seg(hips[0],hips[1],"body")+seg(shs[0],shs[1],"body")+seg(hip,sh,"body")+circ(head,L.head,"body");
    (o.legs||[]).forEach(function(g,i){var kn=P(hips[i],g.t,L.thigh), an=P(kn,g.s,L.shin); out+=seg(hips[i],kn,"body")+seg(kn,an,"body")+seg([an[0]-5,an[1]],[an[0]+5,an[1]],"body"); pts.kn.push(kn); pts.an.push(an);});
    (o.arms||[]).forEach(function(a,i){var el=P(shs[i],a.u,L.ua), wr=P(el,a.f,L.fa); out+=seg(shs[i],el,"body")+seg(el,wr,"body"); pts.el.push(el); pts.wr.push(wr);});
    return {svg:out,pts:pts};
  }
  function pt(p,pts){ // "wr0", "an1", "hip", "sh", or [x,y]
    if(Array.isArray(p)) return p; var m=/^(\w+?)(\d)$/.exec(p); return m?pts[m[1]][+m[2]]:pts[p];
  }
  function props(list,pts){
    var out="";
    (list||[]).forEach(function(p){
      if(p.t==="floor") out+='<line class="prop" x1="8" y1="'+F+'" x2="212" y2="'+F+'"/>';
      else if(p.t==="mat") out+='<line class="prop mat" x1="30" y1="'+F+'" x2="190" y2="'+F+'"/>';
      else if(p.t==="bench") out+='<rect class="prop" x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="6" rx="2"/>'+seg([p.x+6,p.y+6],[p.x+6,F],"prop")+seg([p.x+p.w-6,p.y+6],[p.x+p.w-6,F],"prop");
      else if(p.t==="box") out+='<rect class="prop" x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+(F-p.y)+'" rx="2"/>';
      else if(p.t==="back") out+=seg([p.x,p.y],[p.x,p.y2],"prop"); // bench backrest
      else if(p.t==="tower") out+='<rect class="prop tower" x="'+(p.x-3)+'" y="16" width="6" height="'+(F-16)+'" rx="2"/>';
      else if(p.t==="cable"){var a=pt(p.from,pts), b=pt(p.to,pts); out+=seg(a,b,"cable")+circ(b,3.5,"handle");}
      else if(p.t==="band"){var a2=pt(p.from,pts), b2=pt(p.to,pts); out+=seg(a2,b2,"cable");}
      else if(p.t==="mark"){var c=pt(p.at,pts); out+=circ(c,p.r||11,"mark");}
      else if(p.t==="arrow"){var s=pt(p.from,pts), e=pt(p.to,pts), ang=Math.atan2(e[1]-s[1],e[0]-s[0]); out+=seg(s,e,"arrow")+'<polygon class="arrowhead" points="'+e[0].toFixed(1)+','+e[1].toFixed(1)+' '+(e[0]-8*Math.cos(ang-0.5)).toFixed(1)+','+(e[1]-8*Math.sin(ang-0.5)).toFixed(1)+' '+(e[0]-8*Math.cos(ang+0.5)).toFixed(1)+','+(e[1]-8*Math.sin(ang+0.5)).toFixed(1)+'"/>';}
      else if(p.t==="line") out+=seg(pt(p.from,pts),pt(p.to,pts),"prop");
    });
    return out;
  }

  var ST=85, SUP=134; // standing hip y, supine hip y
  var standLegs=[{t:-90,s:-90}], splitLegs=[{t:-70,s:-100},{t:-112,s:-78,far:true}];
  var POSES={
    breath9090:{v:"side",cap:"On your back, calves resting on the bench, hips and knees at 90°. Ribs down, hands on the lower ribs.",
      fig:{hip:[95,SUP],torso:180,legs:[{t:90,s:0,f:-90}],arms:[{u:15,f:55}]},props:[{t:"mat"},{t:"bench",x:100,y:112,w:60},{t:"mark",at:[80,126]}]},
    pelvicTilt:{v:"side",cap:"Knees bent, feet flat. The low back is pressed flat into the floor; the pelvis tips back toward you.",
      fig:{hip:[95,SUP],torso:180,legs:[{t:60,s:-60}],arms:[{u:8,f:8}]},props:[{t:"mat"},{t:"arrow",from:[80,112],to:[80,129]},{t:"mark",at:[80,135],r:9}]},
    bridge:{v:"side",cap:"Hips lifted until shoulders, hips and knees make one straight line. Squeeze the glutes; don't arch the low back.",
      fig:{hip:[95,118],torso:205,legs:[{t:25,s:-80}],arms:[{u:-5,f:0}]},props:[{t:"mat"},{t:"line",from:[60,133],to:[122,103]},{t:"mark",at:"hip"}]},
    clamshell:{v:"side",cap:"Lying on your side, hips and knees bent, feet together. The top knee opens upward like a clam; the pelvis stays still.",
      fig:{hip:[95,118],torso:180,head:175,legs:[{t:-25,s:205},{t:18,s:228,far:true}],arms:[{u:180,f:180}]},props:[{t:"mat"},{t:"arrow",from:[128,118],to:[128,98]},{t:"mark",at:"kn1"}]},
    deadBug:{v:"side",cap:"One arm reaches back overhead, the opposite leg extends long and low. The other arm and knee stay at 90°. Low back stays flat.",
      fig:{hip:[100,SUP],torso:180,legs:[{t:12,s:5},{t:90,s:0,f:-90,far:true}],arms:[{u:165,f:165},{u:90,f:90,far:true}]},props:[{t:"mat"},{t:"mark",at:[85,139],r:9}]},
    birdDog:{v:"side",cap:"On hands and knees. Opposite arm and leg reach out level with the back. Hips stay square and level; no arch.",
      fig:{hip:[120,105],torso:160,legs:[{t:-90,s:0},{t:15,s:5,far:true}],arms:[{u:-90,f:-90},{u:165,f:165,far:true}]},props:[{t:"mat"},{t:"mark",at:"hip"}]},
    sidePlank:{v:"side",cap:"Forearm under the shoulder, body in one straight line from head to feet (or knees). Hips lifted, not sagging.",
      fig:{hip:[113,116],torso:15,head:15,legs:[{t:195,s:195,f:-90}],arms:[{u:-90,f:0},{u:90,f:90,far:true}]},props:[{t:"mat"},{t:"mark",at:"hip"}]},
    plank:{v:"side",cap:"Forearms down, elbows under shoulders, body in one straight line. Squeeze glutes and brace so the hips don't sag or pike.",
      fig:{hip:[117,113],torso:12,head:12,legs:[{t:192,s:192,f:-90}],arms:[{u:-85,f:0}]},props:[{t:"mat"},{t:"mark",at:"hip"}]},
    pallof:{v:"side",cap:"Side-on to the cable, arms pressed straight out at chest height. The cable pulls you sideways; the trunk stays square and still.",
      fig:{hip:[90,ST],torso:90,legs:standLegs,arms:[{u:0,f:0}]},props:[{t:"floor"},{t:"tower",x:200},{t:"cable",from:[200,55],to:"wr0"},{t:"arrow",from:[150,70],to:[180,70]},{t:"mark",at:[90,68],r:10}]},
    suitcase:{v:"side",cap:"Standing tall with one handle at your side, like a heavy suitcase. Shoulders level, no leaning toward or away from the load. Walk.",
      fig:{hip:[100,ST],torso:90,legs:[{t:-80,s:-95},{t:-100,s:-85,far:true}],arms:[{u:-90,f:-90},{u:-95,f:-95,far:true}]},props:[{t:"floor"},{t:"tower",x:190},{t:"cable",from:[190,138],to:"wr0"},{t:"mark",at:"sh",r:10}]},
    chestPress:{v:"side",cap:"Split stance, cables from behind. Arms pressed straight forward at chest height, elbows soft, shoulders down, ribs stacked over hips.",
      fig:{hip:[100,ST],torso:90,legs:splitLegs,arms:[{u:0,f:0}]},props:[{t:"floor"},{t:"tower",x:20},{t:"cable",from:[20,52],to:"wr0"},{t:"mark",at:"el0",r:9}]},
    fly:{v:"side",cap:"Cables from low behind you. Arms sweep up and forward until the hands meet at eye level, elbows slightly bent, chest up.",
      fig:{hip:[100,ST],torso:90,legs:splitLegs,arms:[{u:40,f:40}]},props:[{t:"floor"},{t:"tower",x:20},{t:"cable",from:[20,130],to:"wr0"},{t:"mark",at:"wr0",r:9}]},
    shoulderPress:{v:"side",cap:"Seated, back against the pad. Arms pressed overhead, slightly in front of the ears. Ribs down; the low back stays on the pad.",
      fig:{hip:[100,111],torso:90,legs:[{t:0,s:-90}],arms:[{u:80,f:85}]},props:[{t:"floor"},{t:"bench",x:70,y:114,w:60},{t:"back",x:92,y:60,y2:114},{t:"tower",x:40},{t:"cable",from:[40,130],to:"wr0"},{t:"mark",at:[97,95],r:9}]},
    lateral:{v:"front",cap:"Cables from low. Arms lift out to the sides until the hands reach shoulder height, elbows slightly bent, shoulders down away from the ears.",
      fig:{hip:[110,ST],legs:[{t:-100,s:-90},{t:-80,s:-90}],arms:[{u:180,f:180},{u:0,f:0}]},props:[{t:"floor"},{t:"cable",from:[40,138],to:"wr0"},{t:"cable",from:[180,138],to:"wr1"},{t:"mark",at:"sh",r:10}]},
    triceps:{v:"side",cap:"Facing the tower, cable from high. Elbows pinned at the sides; forearms press down until the arms are straight. Only the forearm moves.",
      fig:{hip:[90,ST],torso:90,legs:standLegs,arms:[{u:-90,f:-10}]},props:[{t:"floor"},{t:"tower",x:170},{t:"cable",from:[170,28],to:"wr0"},{t:"mark",at:"el0",r:9}]},
    crunch:{v:"side",cap:"Knees bent. Curl up until the shoulder blades leave the floor; the low back stays down. Chin off the chest, hands reach toward the knees.",
      fig:{hip:[100,SUP],torso:150,head:135,legs:[{t:60,s:-60}],arms:[{u:-10,f:-10}]},props:[{t:"mat"},{t:"mark",at:"sh",r:10}]},
    boxSquat:{v:"side",cap:"Sit back until you touch the box, shins close to vertical, handle held at the chest, chest up. Stand by driving through the whole foot.",
      fig:{hip:[100,111],torso:70,legs:[{t:0,s:-85}],arms:[{u:-70,f:100}]},props:[{t:"floor"},{t:"box",x:62,y:114,w:42},{t:"tower",x:195},{t:"cable",from:[195,138],to:"wr0"},{t:"mark",at:"kn0",r:9}]},
    rdl:{v:"side",cap:"Hinge at the hips with a flat back and soft knees, handles sliding down the thighs until you feel the hamstrings. Weight in the heels.",
      fig:{hip:[100,ST],torso:20,head:20,legs:[{t:-100,s:-80}],arms:[{u:-95,f:-95}]},props:[{t:"floor"},{t:"tower",x:190},{t:"cable",from:[190,138],to:"wr0"},{t:"mark",at:[116,80],r:10}]},
    pullThrough:{v:"side",cap:"Cable from low behind you, between the legs. Finish standing tall, glutes squeezed, hands at the front of the thighs. Don't lean back.",
      fig:{hip:[100,ST],torso:90,legs:[{t:-85,s:-92},{t:-95,s:-88,far:true}],arms:[{u:-70,f:-70}]},props:[{t:"floor"},{t:"tower",x:22},{t:"cable",from:[22,138],to:"wr0"},{t:"mark",at:"hip"}]},
    abduction:{v:"front",cap:"Standing on one leg, hand on the tower. The other leg lifts straight out to the side, toes forward. Hips stay level; don't lean away.",
      fig:{hip:[110,ST],legs:[{t:-92,s:-90},{t:-45,s:-45}],arms:[{u:170,f:175},{u:-80,f:-85}]},props:[{t:"floor"},{t:"tower",x:58},{t:"cable",from:[58,138],to:"an1"},{t:"mark",at:"hip",r:12}]},
    situp:{v:"side",cap:"Knees bent, feet anchored. Curl all the way up to sitting, arms reaching forward. Come down slowly, one vertebra at a time.",
      fig:{hip:[100,SUP],torso:80,head:75,legs:[{t:55,s:-65}],arms:[{u:-30,f:-30}]},props:[{t:"mat"},{t:"mark",at:[112,104],r:10}]},
    heelTaps:{v:"side",cap:"On your back, knees bent, shoulders slightly off the floor. Reach one hand down to tap the heel on the same side, then the other.",
      fig:{hip:[100,SUP],torso:160,head:150,legs:[{t:65,s:-70}],arms:[{u:-15,f:-5}]},props:[{t:"mat"},{t:"mark",at:"wr0",r:9}]},
    pulldown:{v:"side",cap:"Seated, cable from high. Pull the handle to the upper chest with the elbows driving down, slight lean back, shoulders pulled down and back.",
      fig:{hip:[100,112],torso:100,head:95,legs:[{t:0,s:-90}],arms:[{u:-60,f:110}]},props:[{t:"floor"},{t:"bench",x:70,y:115,w:56},{t:"tower",x:160},{t:"cable",from:[160,22],to:"wr0"},{t:"mark",at:[88,86],r:10}]},
    row:{v:"side",cap:"Seated, chest up. Pull the handle to the lower ribs with the elbows close to the body and shoulder blades squeezed. Don't lean back to finish.",
      fig:{hip:[95,112],torso:92,legs:[{t:-10,s:-60}],arms:[{u:-120,f:10}]},props:[{t:"floor"},{t:"bench",x:66,y:115,w:56},{t:"tower",x:195},{t:"cable",from:[195,100],to:"wr0"},{t:"mark",at:[97,90],r:10}]},
    oneArmRow:{v:"side",cap:"Split stance, leaning forward with the free hand braced. Pull the elbow back to the hip without twisting the torso.",
      fig:{hip:[95,ST],torso:70,head:65,legs:splitLegs,arms:[{u:-130,f:0},{u:-45,f:-45,far:true}]},props:[{t:"floor"},{t:"tower",x:195},{t:"cable",from:[195,80],to:"wr0"},{t:"mark",at:"el0",r:9}]},
    facePull:{v:"side",cap:"Cable from high. Pull the rope toward the face with the elbows high and wide, hands finishing beside the ears. Squeeze between the shoulder blades.",
      fig:{hip:[95,ST],torso:90,legs:splitLegs,arms:[{u:150,f:20}]},props:[{t:"floor"},{t:"tower",x:195},{t:"cable",from:[195,32],to:"wr0"},{t:"mark",at:"el0",r:9}]},
    curl:{v:"side",cap:"Cable from low. Elbows pinned at the sides; curl the handles to the shoulders. The upper arm doesn't move.",
      fig:{hip:[95,ST],torso:90,legs:standLegs,arms:[{u:-90,f:110}]},props:[{t:"floor"},{t:"tower",x:195},{t:"cable",from:[195,138],to:"wr0"},{t:"mark",at:"el0",r:9}]},
    woodchop:{v:"front",cap:"Cable from high on one side. Arms stay long as you turn from the hips and pull the handle diagonally down to the opposite knee. Feet pivot.",
      fig:{hip:[110,ST],legs:[{t:-100,s:-90},{t:-75,s:-90}],arms:[{u:-30,f:-35},{u:-40,f:-40}]},props:[{t:"floor"},{t:"tower",x:25},{t:"cable",from:[25,24],to:"wr1"},{t:"arrow",from:[70,45],to:[135,95]},{t:"mark",at:"hip",r:12}]},
    pushup:{v:"side",cap:"Bottom of the push-up: body in one straight line, hands under the shoulders, elbows tucked about 45°, chest an inch off the floor.",
      fig:{hip:[117,113],torso:10,head:10,legs:[{t:190,s:190,f:-90}],arms:[{u:-35,f:-140}]},props:[{t:"mat"},{t:"mark",at:"hip"}]},
    curlPress:{v:"side",cap:"Curl the handles to the shoulders, then press overhead until the arms are straight, biceps by the ears. Ribs down at the top.",
      fig:{hip:[100,ST],torso:90,legs:standLegs,arms:[{u:75,f:85}]},props:[{t:"floor"},{t:"tower",x:30},{t:"cable",from:[30,138],to:"wr0"},{t:"mark",at:[97,70],r:9}]}
  };
  function svg(id){
    var p=POSES[id]; if(!p) return "";
    var f=(p.v==="front"?front:side)(p.fig);
    return '<svg class="fig" viewBox="0 0 220 160" role="img" aria-label="End position: '+p.cap.replace(/"/g,"&quot;")+'">'+props(p.props,f.pts)+f.svg+'</svg>';
  }
  window.FIG={svg:svg,caption:function(id){return POSES[id]?POSES[id].cap:"";},has:function(id){return !!POSES[id];},ids:Object.keys(POSES)};
})();
