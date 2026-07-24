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
  basico2: [],
  elemental1: [],
  elemental2: [],
  intermedio1: [],
  intermedio2: [],
  avanzado: []
};
