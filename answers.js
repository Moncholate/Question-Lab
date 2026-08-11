/* ============================================================================
   Respuestas del banco · Question Lab
   ----------------------------------------------------------------------------
   Para el modo «Adivina la wh». Quitarle la wh a una pregunta NO deja un
   ejercicio con solución única: «___ do you live?» admite where, why, how y
   when, y las cuatro dan una pregunta buena. Lo que fija la wh es la RESPUESTA,
   así que sin este archivo el modo no puede existir sin marcar mal cosas que
   están bien.

   Cada entrada es la pregunta tal cual está en bank.js → su respuesta corta.
   Cuando el solapamiento entre dos wh es REAL, va `alt` con las otras que
   también valen: «At eight» responde igual a `when` y a `what time`, y forzar
   una respuesta artificial para separarlas sería enseñar una distinción que el
   idioma no hace. La app las acepta todas y dice cuál era la otra.

   Las respuestas son cortas y de contexto chileno a propósito: el alumno tiene
   que leerlas de un vistazo, y reconocer Temuco o el pastel de choclo ayuda más
   que reconocer Springfield.

   `check-respuestas.mjs` cruza este archivo contra el banco: ninguna pregunta
   abierta sin respuesta, ninguna respuesta huérfana, y ninguna respuesta que
   contenga la propia wh (la regalaría).
   ============================================================================ */
window.QUESTION_ANSWERS = {
  // ── what ──────────────────────────────────────────────────────────────
  "What's your name?": { a: "Valentina Rojas." },
  "What's your phone number?": { a: "It's 9 8765 4321." },
  "What's your favorite food?": { a: "Pastel de choclo." },
  "What day is it today?": { a: "It's Tuesday." },
  "What do you do?": { a: "I'm a nurse." },
  "What are you doing?": { a: "I'm studying for a test." },
  "What are they building?": { a: "A new bridge." },
  "What did you do yesterday?": { a: "I cleaned the house." },
  "What was the problem?": { a: "The engine was broken." },
  "What can you cook?": { a: "I can cook empanadas." },
  "What can I do?": { a: "You can call the teacher." },
  "What's the best restaurant in your city?": { a: "The one next to the market." },
  "What are you reading these days?": { a: "A book about Patagonia." },
  "What would you like to drink?": { a: "A glass of water, please." },
  "What would you like to order?": { a: "The chicken and a salad." },
  "What would you do with a million dollars?": { a: "I would buy a house." },
  "What would you like for lunch?": { a: "A sandwich." },
  "What are you going to do this weekend?": { a: "I'm going to visit my grandmother." },
  "What are you going to study?": { a: "I'm going to study engineering." },
  "What have you done today?": { a: "I've finished my homework." },
  "What has she said?": { a: "She has said nothing." },
  "What were you doing at eight?": { a: "I was having dinner." },
  "What were they talking about?": { a: "They were talking about the exam." },
  "What will you do after graduation?": { a: "I'll look for a job." },
  "What had you done before the meeting?": { a: "I had read the report." },
  "What had he promised?": { a: "He had promised to help us." },
  "What did you use to do as a child?": { a: "I used to play football." },
  "What sports did you use to play?": { a: "Basketball and tennis." },
  "What did you use to eat for breakfast?": { a: "Bread and tea." },
  "What will you do if it rains?": { a: "I'll stay at home." },
  "What would you do if you won the lottery?": { a: "I would travel around the world." },
  "What would you say if I left?": { a: "I would say nothing." },
  "What have you been doing lately?": { a: "I've been working a lot." },
  "What has she been working on?": { a: "She's been working on her thesis." },
  "What have they been saying?": { a: "They've been saying the same thing." },
  "What would you have done if she had called?": { a: "I would have answered." },
  "If I had told you, what would you have said?": { a: "I would have said yes." },

  // ── where ─────────────────────────────────────────────────────────────
  "Where are you from?": { a: "I'm from Valparaíso." },
  "Where's the bank?": { a: "Next to the pharmacy." },
  "Where is your office?": { a: "On the third floor." },
  "Where do you live?": { a: "I live in Santiago." },
  "Where does your family live?": { a: "They live in Temuco." },
  "Where is he going?": { a: "To the airport." },
  "Where are you going now?": { a: "To the library." },
  "Where did they go?": { a: "They went to the beach." },
  "Where were you last night?": { a: "I was at home." },
  "Where was your first job?": { a: "In a small café." },
  "Where can I buy tickets?": { a: "At the entrance." },
  "Where did you spend your holidays?": { a: "In the south of Chile." },
  "Where would you like to sit?": { a: "Next to the window." },
  "Where are you going to live?": { a: "In an apartment downtown." },
  "Where have you been?": { a: "At the doctor's." },
  "Where were they going?": { a: "They were going to the stadium." },
  "Where were you living in 2020?": { a: "I was living in Concepción." },
  "Where will you go next year?": { a: "I'll go to Peru." },
  "Where had they gone?": { a: "They had gone to the hospital." },
  "Where had she worked before?": { a: "In a bank." },
  "Where did you use to live?": { a: "Near the school." },
  "Where did your family use to go in summer?": { a: "We used to go to the coast." },
  "Where will you go if you have time?": { a: "I'll go to the museum." },
  "Where has she been staying?": { a: "At her sister's house." },
  "Where have they been living?": { a: "They've been living in Iquique." },
  "Where would you have gone if you had had the money?": { a: "I would have gone to Europe." },

  // ── who ───────────────────────────────────────────────────────────────
  "Who is that man?": { a: "He's my uncle." },
  "Who are they?": { a: "They're my classmates." },
  "Who is your English teacher?": { a: "Miss Rojas." },
  "Who do you live with?": { a: "I live with my parents." },
  "Who is she talking to?": { a: "To her boss.", alt: ["whom"] },
  "Who did you go with?": { a: "I went with Camila.", alt: ["whom"] },
  "Who was that woman?": { a: "She was the new manager." },
  "Who is the best singer in your country?": { a: "Mon Laferte." },
  "Who are you going to invite?": { a: "My cousins.", alt: ["whom"] },
  "Who were you talking to?": { a: "To my brother.", alt: ["whom"] },
  "Who were you working for?": { a: "For Mr. Silva.", alt: ["whom"] },
  "Who will replace him?": { a: "Andrea will." },
  "Who did you use to sit with?": { a: "I used to sit with Diego.", alt: ["whom"] },
  "Who have you been talking to?": { a: "To my old teacher.", alt: ["whom"] },

  // ── why ───────────────────────────────────────────────────────────────
  "Why are you late?": { a: "Because the bus didn't come." },
  "Why do you study English?": { a: "Because I want a better job." },
  "Why are you laughing?": { a: "Because the video is funny." },
  "Why is the bus stopping?": { a: "Because the light is red." },
  "Why did you change jobs?": { a: "Because the salary was low." },
  "Why was he angry?": { a: "Because we forgot his birthday." },
  "Why has he left?": { a: "Because he felt sick." },
  "Why have you come back?": { a: "Because I forgot my keys." },
  "Why was he crying?": { a: "Because he lost the game." },
  "Why had she quit her job?": { a: "Because she found a better one." },
  "Why had they left so early?": { a: "Because their flight was at six." },
  "Why have they been arguing?": { a: "Because they disagree about money." },
  "Why have you been avoiding the subject?": { a: "Because it makes me nervous." },

  // ── how ───────────────────────────────────────────────────────────────
  "How are you?": { a: "Fine, thanks." },
  "How does she travel to work?": { a: "By metro." },
  "How do you go to work?": { a: "By bike." },
  "How is she feeling today?": { a: "Much better." },
  "How did you learn English?": { a: "By watching movies." },
  "How was your weekend?": { a: "It was great." },
  "How can I help?": { a: "By carrying these boxes." },
  "How well does she write?": { a: "Very well." },
  "How would you like your coffee?": { a: "With milk, no sugar." },
  "How are you going to get there?": { a: "By taxi." },
  "How will they solve this problem?": { a: "By talking to the students." },
  "How did people use to travel?": { a: "On horses." },

  // ── when ──────────────────────────────────────────────────────────────
  /* `when` y `what time` se solapan de verdad cuando la respuesta es una hora:
     «At seven» responde a las dos. Se marcan como alternativas en vez de
     inventar respuestas raras para separarlas. */
  "When do you get up?": { a: "At seven o'clock.", alt: ["what time"] },
  "When do you have English class?": { a: "On Mondays and Wednesdays." },
  "When did the movie start?": { a: "Half an hour ago." },
  "When can you start?": { a: "Next Monday." },
  "When would you like to start?": { a: "As soon as possible." },
  "When are they going to arrive?": { a: "Tomorrow morning." },
  "When are you going to finish?": { a: "In two weeks." },
  "When will the train arrive?": { a: "In ten minutes." },
  "When will you know the answer?": { a: "On Friday." },

  // ── how long ──────────────────────────────────────────────────────────
  "How long did the trip take?": { a: "Six hours." },
  "How long are you going to stay?": { a: "Two weeks." },
  "How long have you known him?": { a: "Since 2019." },
  "How long will the trip take?": { a: "About four hours." },
  "How long had you waited?": { a: "Forty minutes." },
  "How long have you been working here?": { a: "For three years." },
  "How long have you been studying English?": { a: "For five years." },
  "How long has it been raining?": { a: "Since this morning." },

  // ── what time ─────────────────────────────────────────────────────────
  "What time is it?": { a: "It's a quarter past ten." },
  "What time is your class?": { a: "At eight thirty.", alt: ["when"] },
  "What time do you have lunch?": { a: "At one o'clock.", alt: ["when"] },
  "What time do you start work?": { a: "At nine sharp.", alt: ["when"] },
  "What time did you get home?": { a: "At midnight.", alt: ["when"] },
  "What time do you have to start work?": { a: "At seven in the morning.", alt: ["when"] },

  // ── which ─────────────────────────────────────────────────────────────
  "Which bag is yours?": { a: "The black one." },
  "Which team was better?": { a: "The visiting team." },
  "Which one can I take?": { a: "The one on the left." },
  "Which city is bigger?": { a: "Santiago." },
  "Which table would you like?": { a: "The one by the window." },
  "Which option will you choose?": { a: "The second one." },

  // ── how much ──────────────────────────────────────────────────────────
  "How much is a coffee?": { a: "Two thousand pesos." },
  "How much do you pay for the bus?": { a: "Eight hundred pesos." },
  "How much did you pay?": { a: "Thirty thousand pesos." },
  "How much can I spend?": { a: "Up to fifty dollars." },
  "How much did the tickets cost?": { a: "Twenty thousand pesos each." },

  // ── how many ──────────────────────────────────────────────────────────
  "How many hours do you work?": { a: "Forty hours a week." },
  "How many countries have you visited?": { a: "Seven countries." },
  "How many times have you changed jobs?": { a: "Three times." },
  "How many times had you tried?": { a: "Twice." },
  "How many hours have you been waiting?": { a: "Two hours." },

  // ── how often ─────────────────────────────────────────────────────────
  "How often do you exercise?": { a: "Three times a week." },
  "How often do you cook?": { a: "Almost every day." },
  "How often do you go to the gym?": { a: "Twice a week." },
  "How often did you use to travel?": { a: "Once a year." },

  // ── how old ───────────────────────────────────────────────────────────
  "How old is she?": { a: "She's twenty-three." },
  "How old are you?": { a: "I'm nineteen." },
  "How old were you then?": { a: "I was fifteen." },

  // ── how fast ──────────────────────────────────────────────────────────
  "How fast does the metro go?": { a: "About eighty kilometres an hour." },
  "How fast was he driving?": { a: "At a hundred and twenty." },

  // ── uno de cada ───────────────────────────────────────────────────────
  "What color is your car?": { a: "It's dark blue." },
  "Whose book is this?": { a: "It's Camila's." },
  "What kind of music do you like?": { a: "Cumbia and rock." },
  "How far is your house from here?": { a: "Three blocks." },
};
