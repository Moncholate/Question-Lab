/* ============================================================================
   Question Lab · Banco de preguntas para las actividades de práctica.
   ----------------------------------------------------------------------------
   Para AGREGAR preguntas: pega la oración (con «?») en el arreglo del nivel que
   corresponda. No hay que etiquetar nada más — la app deriva el TIEMPO y si es
   ABIERTA/CERRADA con su analizador, y balancea el azar entre tiempos y tipos.
   El nivel es la llave del arreglo; el filtrado es acumulativo (un alumno en un
   nivel practica ese nivel y todos los anteriores).
   ============================================================================ */
window.QUESTION_BANK = {
  basico1: [
    // Verbo to be (presente) — cerradas
    "Are you from Chile?",
    "Is she a teacher?",
    "Are they students?",
    "Is he your brother?",
    "Is it a good restaurant?",
    "Are you tired?",
    "Is she Mexican?",
    "Are your parents at home?",
    // Verbo to be (presente) — abiertas
    "What's your name?",
    "Where are you from?",
    "How old is she?",
    "Who is that man?",
    "What color is your car?",
    "What's your phone number?",
    "Where's the bank?",
    "How are you?",
    "What time is it?",
    "Who are they?",
    // Presente simple — cerradas
    "Do you like coffee?",
    "Does he speak English?",
    "Do they live here?",
    "Do you have a car?",
    "Does she work on Saturdays?",
    "Do you play soccer?",
    // Presente simple — abiertas
    "Where do you live?",
    "What do you do?",
    "When do you get up?",
    "How does she travel to work?",
    "What time do you have lunch?",
    "How often do you exercise?"
  ],
  basico2: [
    // Presente continuo — cerradas
    "Are you studying English?",
    "Is she cooking dinner?",
    "Are they playing outside?",
    "Is it raining?",
    // Presente continuo — abiertas
    "What are you doing?",
    "Where is he going?",
    "Why are you laughing?",
    "Who is she talking to?",
    // Pasado simple — cerradas
    "Did you watch the movie?",
    "Did she call you?",
    "Did they arrive late?",
    "Did you have breakfast?",
    // Pasado simple — abiertas
    "What did you do yesterday?",
    "Where did they go?",
    "When did the movie start?",
    "How did you learn English?",
    // Verbo to be (pasado) — cerradas
    "Were you at the party?",
    "Was the film good?",
    "Was she your teacher?",
    "Were they happy?",
    // Verbo to be (pasado) — abiertas
    "Where were you last night?",
    "Why was he angry?",
    "How was your weekend?",
    "Who was that woman?",
    // Modal (can) — cerradas
    "Can you swim?",
    "Can she drive?",
    "Can I help you?",
    "Can they come tomorrow?",
    // Modal (can) — abiertas
    "What can you cook?",
    "Where can I buy tickets?",
    "How can I help?"
  ],
  elemental1: [
    // Sin tiempo nuevo (AEF Elemental I): variedad con tiempos ya vistos.
    // Comparativos / superlativos (to be)
    "Is your city bigger than Santiago?",
    "Is English more difficult than Spanish?",
    "Who is the best singer in your country?",
    // Presente simple (have to, frecuencia, adverbios de modo)
    "Do you usually work on weekends?",
    "Do you have to wear a uniform?",
    "What time do you have to start work?",
    "How often do you go to the gym?",
    "Does he speak English well?",
    // Presente continuo (contraste con el simple)
    "Are you working right now?",
    "What are you reading these days?",
    // Pasado simple (repaso)
    "Did you enjoy the concert?",
    "Where did you spend your holidays?",
    "How much did the tickets cost?"
  ],
  elemental2: [
    // Futuro con «going to» — cerradas
    "Are you going to travel this summer?",
    "Is she going to study medicine?",
    "Are they going to buy a house?",
    "Is it going to rain tomorrow?",
    // Futuro con «going to» — abiertas
    "What are you going to do this weekend?",
    "Where are you going to live?",
    "When are they going to arrive?",
    "How are you going to get there?",
    // Presente perfecto — cerradas
    "Have you ever been to Europe?",
    "Has she finished her homework?",
    "Have they seen this movie?",
    "Have you ever eaten sushi?",
    // Presente perfecto — abiertas
    "What have you done today?",
    "Where have you been?",
    "How many countries have you visited?",
    "Why has he left?"
  ],
  intermedio1: [
    // Pasado continuo — cerradas
    "Were you sleeping when I called?",
    "Was she watching TV?",
    "Were they waiting for us?",
    "Was it raining this morning?",
    // Pasado continuo — abiertas
    "What were you doing at eight?",
    "Where were they going?",
    "Why was he crying?",
    "Who were you talking to?",
    // Futuro con «will» — cerradas
    "Will you help me?",
    "Will she come to the party?",
    "Will they finish on time?",
    "Will it be sunny tomorrow?",
    // Futuro con «will» — abiertas
    "What will you do after graduation?",
    "Where will you go next year?",
    "When will the train arrive?",
    "How will they solve this problem?"
  ],
  intermedio2: [
    // Pasado perfecto — cerradas
    "Had you met him before?",
    "Had she left when you arrived?",
    "Had they finished the project?",
    "Had he ever flown before?",
    // Pasado perfecto — abiertas
    "What had you done before the meeting?",
    "Where had they gone?",
    "Why had she quit her job?",
    "How long had you waited?",
    // Used to — cerradas
    "Did you use to play football?",
    "Did she use to live in Madrid?",
    "Did they use to work together?",
    "Did he use to study French?",
    // Used to — abiertas
    "What did you use to do as a child?",
    "Where did you use to live?",
    "What sports did you use to play?",
    "How did people use to travel?"
  ],
  avanzado: [
    // Presente perfecto continuo — cerradas
    "Have you been waiting long?",
    "Has she been studying all day?",
    "Have they been living here for years?",
    "Has it been raining all night?",
    // Presente perfecto continuo — abiertas
    "What have you been doing lately?",
    "How long have you been working here?",
    "Why have they been arguing?",
    "Where has she been staying?"
  ]
};
