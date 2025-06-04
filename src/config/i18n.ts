
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Sample translation files
import translationEN from "../locales/en/translation.json";
import translationAR from "../locales/ar/translation.json";

// Spanish translations
const translationES = {
  "header": {
    "home": "Inicio",
    "about": "Acerca de",
    "courses": "Cursos",
    "inscription": "Inscripción",
    "contact": "Contacto",
    "teachers": "Profesores",
    "login": "Iniciar Sesión"
  },
  "nav": {
    "home": "Inicio",
    "professors": "Profesores",
    "languages": "Idiomas",
    "register": "Registrarse",
    "contact": "Contacto"
  },
  "button": {
    "register": "Registrarse"
  },
  "hero": {
    "title": "Cursos de Idiomas de Alta Calidad",
    "subtitle": "a Precios Asequibles",
    "description": "Creemos que elegir el curso correcto no debería ser complicado. Si no estás satisfecho con el curso que elegiste, ofrecemos una garantía completa de devolución de dinero por 60 días.",
    "startJourney": "Comienza tu Viaje de Aprendizaje",
    "watchHow": "Mira Cómo Trabajamos",
    "activeStudents": "Estudiantes Activos",
    "availableCourses": "Cursos Disponibles",
    "userRating": "Calificación de Usuario",
    "startNow": "Comienza Ahora",
    "guarantee": "Garantía de 60 Días"
  },
  "payment": {
    "title": "Pago",
    "description": "Complete su pago para acceder a los materiales del curso.",
    "bank2": "CIH",
    "bank1": "Barid",
    "holder": "Nombre"
  },
  "inscription": {
    "full_name": "Nombre Completo",
    "age": "Edad",
    "email": "Email",
    "phone": "Número de Teléfono",
    "level": {
      "title": "Nivel",
      "description": "Seleccione su nivel actual en programación",
      "beginner": "Principiante",
      "intermediate": "Intermedio",
      "advanced": "Avanzado",
      "register": "Registrarse Ahora"
    },
    "language": "Idioma",
    "preference": "Preferencia",
    "password": "Contraseña",
    "confirm_password": "Confirmar Contraseña",
    "submit": "Enviar",
    "password_mismatch": "Las contraseñas no coinciden",
    "success_title": "Mensaje Enviado Exitosamente",
    "success_description": "Nos pondremos en contacto contigo pronto"
  },
  "contact": {
    "title": "Contáctanos",
    "description": "Si tienes preguntas o necesitas ayuda, contáctanos usando el formulario.",
    "form": {
      "name": "Tu Nombre",
      "email": "Tu Email",
      "message": "Tu Mensaje",
      "submit": "Enviar Mensaje"
    },
    "successMessage": "¡Gracias por contactarnos! Te responderemos pronto."
  },
  "languages": {
    "title": "Descubre los Idiomas Disponibles",
    "subtitle": "Elige el idioma que quieres aprender con los mejores profesores especializados"
  },
  "teachers": {
    "title": "Conoce a Nuestros Distinguidos Profesores",
    "subtitle": "Un equipo de profesores calificados especializados en la enseñanza de idiomas usando los métodos interactivos más modernos"
  },
  "admin": {
    "loading": "Cargando..."
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      ar: { translation: translationAR },
      es: { translation: translationES },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
