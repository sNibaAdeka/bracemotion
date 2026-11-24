/** Public-safe facts from the supplied 32-slide project presentation.
 * Dates are intentionally omitted: version order is verified, a full dated chronology is not.
 * Source deck and private contact/patient material must never enter the public bundle.
 */
export const developmentHistory = [
  {id:'v1', label:'V1', title:'Testing the mechanics', description:'Arduino Uno, servomotors and an elastic bandage. The first design proved bulky, rigid and ineffective at mechanically compensating for tremor.', source:'Project presentation, slide 3'},
  {id:'v2', label:'V2', title:'Moving to vibration', description:'The team moved to vibration stimulation and added a protective case. The next challenge was a smaller design and more convenient charging.', image:'/images/prototype-v2.webp', imageAlt:'The real BraceMotion V2 prototype: a black case and wide fabric strap', source:'Project presentation, slide 8'},
  {id:'v3', label:'V3', title:'Settings and monitoring', description:'A smaller case, external USB-C port, gyroscope and an app for monitoring movement and adjusting vibration. The app screens in the presentation are labeled as demos.', image:'/images/prototype-v3-closed.webp', imageAlt:'The real BraceMotion V3 prototype: a white case with protruding screws', source:'Project presentation, slides 11–12'},
  {id:'v4', label:'V4', title:'A more compact design', description:'A more compact case, slim fabric strap and ESP32-C3 Super Mini controller. The latest physical version shown in the supplied presentation.', image:'/images/prototype-v4-closed.webp', imageAlt:'The real BraceMotion V4 prototype: a compact white case on a light-colored strap', source:'Project presentation, slide 16'},
] as const;

export const projectFaq = [
  {id:'status', terms:['стад', 'готов', 'сертиф', 'валидац', 'эффектив', 'безопас', 'stage', 'certif', 'clinical', 'ready', 'research', 'validat', 'effectiv', 'safety'], answer:'BraceMotion is a research prototype undergoing testing. Clinical effectiveness has not been established, and the device is not yet medically certified. Source: project presentation, slide 29.'},
  {id:'controller', terms:['контроллер','процессор','esp32','controller','chip','processor'], answer:'The fourth version uses an ESP32-C3 Super Mini controller. The presentation does not specify the exact case dimensions or the number of motors in V4. Source: slide 16.'},
  {id:'app', terms:['прилож','bluetooth','блют','режим','настрой','app','demo','демо','setting'], answer:'The app prototype shows vibration-mode settings and sensor readings. The presentation screens are labeled Demo, Simulation and Demo mode: these are demonstration data, not verified patient telemetry. Finished-product reliability and release availability have not been verified. Sources: slides 11–12 and 16.'},
  {id:'model', terms:['3d','модел','разбор','крыш','cad','model','disassembl','lid'], answer:'The 3D visualization was reconstructed from photographs of the V4 prototype. The strap unfolds, the removable lid lifts and the interior is shown schematically. This is an illustration, not a measured CAD model or an operating guide. Source for physical details: slide 16.'},
  {id:'history', terms:['верс','истор','разраб','v1','v2','v3','v4','version','history','develop'], answer:'V1 tested mechanical compensation and proved ineffective and uncomfortable. V2 moved to vibration stimulation with a protective case. V3 introduced a smaller case, an external USB-C port, a gyroscope and an app. V4 reduced the case and strap size and moved to ESP32-C3 Super Mini. A complete dated chronology has not been verified. Sources: slides 3, 8, 11 and 16.'},
  {id:'function', terms:['умеет','функц','вибра','гироскоп','датчик','движен','function','vibrat','sensor','gyro','movement'], answer:'The project presents vibration stimulation, gyroscope-based movement monitoring and app-controlled modes. These are research prototype capabilities, not evidence of medical effectiveness. Sources: slides 8, 11–12 and 16.'},
  {id:'contact', terms:['связ','контакт','сотруд','команд','contact','collaborat','партн','team','partner'], answer:'Use the “Discuss the project” form below to discuss research, hardware or software. The site confirms that an inquiry is saved only after it has been successfully written to storage. Do not submit diagnoses or other medical information.'},
  {id:'purchase', terms:['куп','цен','стоим','заказ','price','buy','order','cost','purchas'], answer:'The website does not provide a confirmed sales offer, price or checkout. BraceMotion is presented as a research prototype. Contact the team through the inquiry form to ask about current availability.'},
] as const;

export function answerProjectQuestion(query:string, signal?:AbortSignal):string {
  if (signal?.aborted) throw new DOMException('Canceled', 'AbortError');
  const normalized = query.normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
  if (!normalized) throw new Error('Enter a question about the project.');
  if (/диагноз|дозиров|лечени|лечить|лекарств|мне (?:можно|нужно)|мо[йяе] (?:тремор|болезнь)|diagnos|dosage|treat|medicat/i.test(normalized)) {
    return 'This local guide answers questions about the project only and does not provide personal medical advice. Clinical effectiveness of BraceMotion has not been established, and the device is not yet medically certified. Discuss diagnosis or treatment with a qualified healthcare professional.';
  }
  const scored = projectFaq.map(item => ({item, score:item.terms.filter(term => normalized.includes(term)).length})).sort((a,b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].item.answer : 'The verified project materials do not answer this question. You can ask about versions V1–V4, the controller, 3D model, demo app or research stage. For other questions, use the inquiry form below.';
}
