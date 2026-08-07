import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const cloudBackground = '1f9c5ed325dfbc5169a37f5e8fdbb340d9b3eb52847eaec2f0ebcd44bf3103c0.png';
const cloudRunner = 'd6a8dec1b76bc367b3d6f03080a5da8f8059db0b2936ec75a8e8ce302f7acb2a.png';

export function makeWorkflow(market) {
  const id = market.id.toUpperCase().replaceAll('-', '_');
  const exclusions = market.avoid.join(', ');
  const skylinePrompt = `Edit only the flat red Seattle skyline silhouette in this crop. Replace it with ${market.skylinePrompt}. Use the exact same graphic language: pure signal-red flat vector silhouette anchored to the bottom edge, pure black background, hard clean edges. Preserve all existing white grid lines and the red circular arc exactly. Do not add text, letters, numbers, logos, people, flags, photography, gradients, texture, shadows, or postcard motifs. Avoid ${exclusions}. Return one clean edited image.`;
  const personaPrompt = `Create a NEW fictional person from this reference: ${market.personaPrompt}. Preserve the exact front-facing hands-on-hips running pose, camera angle, body scale, crop, centered silhouette, grayscale high-contrast halftone print texture, black athletic top with the supplied NIKE word treatment, white forearm bands, and black lower garment. Change the person's identity and facial features; do not merely recolor the supplied person. Keep styling contemporary and globally credible, with no national costume, flag, landmark, souvenir styling, caricature, text additions, extra logos, jewelry additions, extra limbs, or anatomy changes. Place the full isolated figure against a plain neutral studio background with a clean continuous silhouette. Return one image.`;
  return {
    '1': {class_type:'LoadImage',inputs:{image:cloudBackground},_meta:{title:'01 · LOCKED campaign background'}},
    '2': {class_type:'ImageCrop',inputs:{image:['1',0],width:570,height:365,x:100,y:1030},_meta:{title:'02 · Isolate variable skyline module'}},
    '3': {class_type:'GeminiImage2Node',inputs:{images:['2',0],prompt:skylinePrompt,model:'gemini-3-pro-image-preview',seed:498017,aspect_ratio:'auto',resolution:'1K',response_modalities:'IMAGE',system_prompt:'You edit one protected module in a campaign system. Follow the landmark substitution literally, preserve non-skyline pixels, never invent typography or logos, and always return an image.'},_meta:{title:`03A · NANO BANANA PRO · ${market.city} skyline`}},
    '4': {class_type:'ImageScale',inputs:{image:['3',0],upscale_method:'lanczos',width:570,height:365,crop:'disabled'},_meta:{title:'04A · Normalize generated module'}},
    '5': {class_type:'ImageCompositeMasked',inputs:{destination:['1',0],source:['4',0],x:100,y:1030,resize_source:false},_meta:{title:'05A · Reinsert into protected campaign plate'}},
    '6': {class_type:'SaveImage',inputs:{images:['5',0],filename_prefix:`NRC_LOCALIZE/${id}_CITY_PLATE`},_meta:{title:'OUTPUT A · Localized city plate'}},
    '7': {class_type:'LoadImage',inputs:{image:cloudRunner},_meta:{title:'01B · Supplied pose + wardrobe reference'}},
    '8': {class_type:'GeminiImage2Node',inputs:{images:['7',0],prompt:personaPrompt,model:'gemini-3-pro-image-preview',seed:904221,aspect_ratio:'auto',resolution:'1K',response_modalities:'IMAGE',system_prompt:'Generate a new fictional adult runner while preserving pose, crop, garment structure, and graphic treatment from the reference. Avoid stereotypes. Always return an image.'},_meta:{title:`03B · NANO BANANA PRO · ${market.city} fictional runner`}},
    '9': {class_type:'RecraftRemoveBackgroundNode',inputs:{image:['8',0]},_meta:{title:'04B · Remove generated studio background'}},
    '10': {class_type:'InvertMask',inputs:{mask:['9',1]},_meta:{title:'05B · Convert removal mask to PNG alpha'}},
    '11': {class_type:'SaveImageWithAlpha',inputs:{images:['9',0],mask:['10',0],filename_prefix:`NRC_LOCALIZE/${id}_RUNNER_ALPHA`},_meta:{title:'OUTPUT B · Localized runner with alpha'}},
    '12': {class_type:'ImageCompositeMasked',inputs:{destination:['5',0],source:['9',0],x:0,y:0,resize_source:true,mask:['9',1]},_meta:{title:'06 · Composite localized persona over localized city'}},
    '13': {class_type:'SaveImage',inputs:{images:['12',0],filename_prefix:`NRC_LOCALIZE/${id}_COMFY_COMPOSITE`},_meta:{title:'OUTPUT C · Comfy validation composite'}},
    '14': {class_type:'SaveImage',inputs:{images:['8',0],filename_prefix:`NRC_LOCALIZE/${id}_RUNNER_RAW`},_meta:{title:'QA · Raw localized runner generation'}}
  };
}

export function makeCityDrivenWorkflow() {
  const strategistPrompt = 'You are a localization strategist for a global running campaign. The user supplies only a city name. Return valid minified JSON and nothing else, with exactly these string keys: skyline_prompt, runner_prompt, locale, copy_direction, human_review. The skyline_prompt must identify one or two visually recognizable built landmarks that genuinely belong to the city, describe their silhouette relationship, and then require this fixed treatment: edit only the flat red skyline inside the protected crop; pure signal-red flat vector silhouette anchored to the bottom; pure black background; hard clean edges; preserve every white grid line and red circular arc; no text, letters, numbers, logos, people, flags, photography, gradients, texture, shadows, national symbols, costume, or postcard collage. The runner_prompt must create a NEW fictional adult runner with a credible contemporary local running-club casting direction. It must change identity and facial features rather than recoloring the reference, avoid guessing a single ethnicity from the city, and avoid stereotypes, national costume, flags, landmarks, souvenir styling, caricature, new text, extra logos, jewelry additions, extra limbs, or anatomy changes. It must preserve the exact front-facing hands-on-hips pose, camera angle, body scale, crop, centered silhouette, grayscale high-contrast halftone print texture, black athletic top with the supplied NIKE word treatment, white forearm bands, and black lower garment, against a plain neutral studio background. locale must be a likely BCP-47 locale for the city but acknowledge ambiguity in human_review when relevant. copy_direction must be a short locally appropriate creative direction, not final translated copy. human_review must name language, cultural, casting, landmark, brand, and rights checks. Do not use markdown fences.';
  const warmupPrompt = 'Animate only the isolated runner. Locked camera and locked framing. The runner performs a subtle pre-run warm-up: one controlled shoulder roll, a gentle standing side stretch, then returns to the original front-facing hands-on-hips pose. Preserve the same fictional identity, face, anatomy, body proportions, centered placement, crop, grayscale high-contrast halftone print treatment, black athletic top with the supplied NIKE word treatment, white forearm bands, and black lower garment. Keep motion natural, athletic, restrained, and continuous. Use a plain neutral temporary background. No environment, props, typography, new logos, wardrobe changes, scene changes, or camera movement.';
  const warmupNegativePrompt = 'background motion, moving poster, moving skyline, moving graphics, moving text, camera motion, zoom, pan, tilt, cuts, scene change, clothing change, logo change, text change, identity drift, face drift, extra people, extra limbs, missing limbs, anatomy distortion, leaving frame, jumping, running away, dramatic motion';
  return {
    '1': {class_type:'PrimitiveString',inputs:{value:'NEW YORK'},_meta:{title:'00 · CITY INPUT · CHANGE ONLY THIS'}},
    '2': {class_type:'LoadImage',inputs:{image:cloudBackground},_meta:{title:'01A · LOCKED campaign background'}},
    '3': {class_type:'ImageCrop',inputs:{image:['2',0],width:570,height:365,x:100,y:1030},_meta:{title:'02A · Isolate variable skyline module'}},
    '4': {class_type:'GeminiNodeV2',inputs:{prompt:['1',0],model:'Gemini 3.1 Flash-Lite','model.thinking_level':'LOW','model.temperature':0.2,'model.top_p':0.9,'model.max_output_tokens':4096,seed:44017,system_prompt:strategistPrompt},_meta:{title:'01 · LOCALIZATION STRATEGIST LLM · City to structured brief'}},
    '5': {class_type:'JsonExtractString',inputs:{json_string:['4',0],key:'skyline_prompt'},_meta:{title:'03A · Extract detailed skyline prompt'}},
    '6': {class_type:'GeminiImage2Node',inputs:{images:['3',0],prompt:['5',0],model:'gemini-3-pro-image-preview',seed:498017,aspect_ratio:'auto',resolution:'1K',response_modalities:'IMAGE',system_prompt:'Execute the supplied structured skyline art direction literally. Preserve protected non-skyline pixels, never invent typography or logos, and always return an image.'},_meta:{title:'04A · NANO BANANA PRO · Strategist-directed skyline'}},
    '7': {class_type:'ImageScale',inputs:{image:['6',0],upscale_method:'lanczos',width:570,height:365,crop:'disabled'},_meta:{title:'05A · Normalize generated skyline module'}},
    '8': {class_type:'ImageCompositeMasked',inputs:{destination:['2',0],source:['7',0],x:100,y:1030,resize_source:false},_meta:{title:'06A · Reinsert into protected campaign plate'}},
    '9': {class_type:'SaveImage',inputs:{images:['8',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_CITY_PLATE'},_meta:{title:'OUTPUT A · Dynamic localized city plate'}},
    '10': {class_type:'LoadImage',inputs:{image:cloudRunner},_meta:{title:'01B · Supplied pose + wardrobe reference'}},
    '11': {class_type:'JsonExtractString',inputs:{json_string:['4',0],key:'runner_prompt'},_meta:{title:'03B · Extract detailed fictional-runner prompt'}},
    '12': {class_type:'GeminiImage2Node',inputs:{images:['10',0],prompt:['11',0],model:'gemini-3-pro-image-preview',seed:904221,aspect_ratio:'auto',resolution:'1K',response_modalities:'IMAGE',system_prompt:'Execute the supplied structured casting and art direction literally. Generate a new fictional adult runner while preserving pose, crop, garment structure, and graphic treatment from the reference. Avoid stereotypes. Always return an image.'},_meta:{title:'04B · NANO BANANA PRO · Strategist-directed fictional runner'}},
    '13': {class_type:'RecraftRemoveBackgroundNode',inputs:{image:['12',0]},_meta:{title:'05B · Remove generated studio background'}},
    '14': {class_type:'InvertMask',inputs:{mask:['13',1]},_meta:{title:'06B · Convert removal mask to PNG alpha'}},
    '15': {class_type:'SaveImageWithAlpha',inputs:{images:['13',0],mask:['14',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_RUNNER_ALPHA'},_meta:{title:'OUTPUT B · Dynamic runner with alpha'}},
    '16': {class_type:'ImageCompositeMasked',inputs:{destination:['8',0],source:['13',0],x:0,y:0,resize_source:true,mask:['13',1]},_meta:{title:'07 · Composite dynamic persona over dynamic city'}},
    '17': {class_type:'SaveImage',inputs:{images:['16',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_COMFY_COMPOSITE'},_meta:{title:'OUTPUT C · Dynamic Comfy composite'}},
    '18': {class_type:'SaveImage',inputs:{images:['12',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_RUNNER_RAW'},_meta:{title:'QA · Raw dynamically generated runner'}},
    '19': {class_type:'KlingVideoNode',inputs:{multi_shot:'disabled','multi_shot.prompt':warmupPrompt,'multi_shot.negative_prompt':warmupNegativePrompt,'multi_shot.duration':5,generate_audio:false,model:'kling-v3','model.resolution':'1080p','model.aspect_ratio':'9:16',seed:290317,start_frame:['13',0]},_meta:{title:'08 · KLING 3.0 · Animate ONLY the isolated runner'}},
    '20': {class_type:'BriaVideoReplaceBackground',inputs:{video:['19',0],seed:290318,background_image:['8',0]},_meta:{title:'09 · BRIA VIDEO MATTE · Replace temporary BG with LOCKED city plate'}},
    '21': {class_type:'SaveVideo',inputs:{video:['20',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_RUNNER_WARMUP',format:'mp4',codec:'auto'},_meta:{title:'OUTPUT D · Locked-poster runner warm-up MP4'}},
    '22': {class_type:'SaveText',inputs:{text:['4',0],filename_prefix:'NRC_LOCALIZE/CITY_INPUT_AGENT_HANDOFF',format:'json'},_meta:{title:'OUTPUT E · Agent handoff JSON · prompts + locale + review'}}
  };
}

for (const market of localizations) {
  fs.writeFileSync(path.join(root, 'workflows', `nano-banana-pro-${market.id}.api.json`), `${JSON.stringify(makeWorkflow(market), null, 2)}\n`);
}
fs.writeFileSync(path.join(root, 'workflows', 'nano-banana-pro-full-localizer.api.json'), `${JSON.stringify(makeCityDrivenWorkflow(), null, 2)}\n`);
console.log(`Built ${localizations.length} full localization workflows with skyline + persona generation.`);
