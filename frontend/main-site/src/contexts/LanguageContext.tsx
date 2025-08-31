import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define available languages
export type SupportedLanguage = 'ar' | 'en' | 'es';

type Translations = {
  [key: string]: {
    [key in SupportedLanguage]: string;
  };
};

// Initial translation data
const translations: Translations = {
  // Common UI elements
  "nav.home": {
    ar: "الرئيسية",
    en: "Home",
    es: "Inicio",
  },
  "nav.professors": {
    ar: "المدرسين",
    en: "Professors",
    es: "Profesores",
  },
  "nav.languages": {
    ar: "اللغات",
    en: "Languages",
    es: "Idiomas",
  },
  "nav.register": {
    ar: "التسجيل",
    en: "Register",
    es: "Registro",
  },
  "nav.contact": {
    ar: "اتصل بنا",
    en: "Contact Us",
    es: "Contacto",
  },
  "button.register": {
    ar: "سجل الآن",
    en: "Register Now",
    es: "Regístrate Ahora",
  },
  "button.submit": {
    ar: "إرسال",
    en: "Submit",
    es: "Enviar",
  },
  "button.cancel": {
    ar: "إلغاء",
    en: "Cancel",
    es: "Cancelar",
  },
  "button.registering": {
    ar: "جاري التسجيل...",
    en: "Registering...",
    es: "Registrando...",
  },
  "button.submitRegistration": {
    ar: "إرسال طلب التسجيل",
    en: "Submit Registration",
    es: "Enviar Registro",
  },
  "languages.title": {
    ar: "اللغات المتوفرة",
    en: "Available Languages",
    es: "Idiomas Disponibles",
  },
  "languages.registerCourse": {
    ar: "سجل في إحدى دوراتنا",
    en: "Register for a course",
    es: "Regístrate en un curso",
  },
  "language.select": {
    ar: "اختر اللغة",
    en: "Select Language",
    es: "Seleccionar Idioma",
  },
  // Hero Section
  "hero.title": {
    ar: "دورات لغوية عالية الجودة بأسعار معقولة",
    en: "High-Quality Language Courses at Reasonable Prices",
    es: "Cursos de Idiomas de Alta Calidad a Precios Razonables",
  },
  "hero.description1": {
    ar: "نعتقد أن اختيار الدورة المناسبة لا يجب أن يكون أمرًا معقدًا. إذا لم تكن راضيًا عن الدورة التي اخترتها.",
    en: "We believe that choosing the right course shouldn't be complicated. If you're not satisfied with your chosen course.",
    es: "Creemos que elegir el curso adecuado no debería ser complicado. Si no estás satisfecho con el curso que elegiste.",
  },
  "hero.description2": {
    ar: "ابدأ الآن تعلم لغتك المفضلة في بيئة تعليمية مريحة وبأسعار مناسبة!",
    en: "Start learning your favorite language now in a comfortable educational environment at affordable prices!",
    es: "¡Empieza a aprender tu idioma favorito ahora en un entorno educativo cómodo y a precios asequibles!",
  },
  "hero.imageAlt": {
    ar: "دورة لغوية",
    en: "Language Course",
    es: "Curso de Idioma",
  },
  "button.meetProfessors": {
    ar: "تعرف على أساتذتنا",
    en: "Meet Our Professors",
    es: "Conoce a Nuestros Profesores",
  },
  // Features Section
  "features.whyChooseUs": {
    ar: "لماذا تختارنا؟",
    en: "Why Choose Us?",
    es: "¿Por qué elegirnos?",
  },
  "features.quality": {
    ar: "جودة عالية",
    en: "High Quality",
    es: "Alta Calidad",
  },
  "features.quality.desc": {
    ar: "أساتذة متخصصون في تدريس اللغات بشهادات معتمدة وخبرات واسعة",
    en: "Specialized professors in language teaching with certified qualifications and extensive experience",
    es: "Profesores especializados en la enseñanza de idiomas con cualificaciones certificadas y amplia experiencia",
  },
  "features.prices": {
    ar: "أسعار معقولة",
    en: "Reasonable Prices",
    es: "Precios Razonables",
  },
  "features.prices.desc": {
    ar: "أسعار تنافسية مع خيارات متعددة تناسب مختلف الميزانيات",
    en: "Competitive prices with multiple options to suit different budgets",
    es: "Precios competitivos con múltiples opciones para adaptarse a diferentes presupuestos",
  },
  "features.schedule": {
    ar: "مواعيد مرنة",
    en: "Flexible Schedule",
    es: "Horario Flexible",
  },
  "features.schedule.desc": {
    ar: "دورات صباحية ومسائية وعطلة نهاية الأسبوع لتناسب جدولك الزمني",
    en: "Morning, evening and weekend courses to suit your schedule",
    es: "Cursos de mañana, tarde y fin de semana para adaptarse a tu horario",
  },
  "features.groups": {
    ar: "مجموعات صغيرة",
    en: "Small Groups",
    es: "Grupos Pequeños",
  },
  "features.groups.desc": {
    ar: "عدد محدود من الطلاب في كل مجموعة لضمان الاستفادة القصوى",
    en: "Limited number of students in each group to ensure maximum benefit",
    es: "Número limitado de estudiantes en cada grupo para garantizar el máximo beneficio",
  },
  // Testimonials Section
  "testimonials.title": {
    ar: "ماذا يقول طلابنا",
    en: "What Our Students Say",
    es: "Lo que dicen nuestros estudiantes",
  },
  // Teachers/Professors Section
  "professors.title": {
    ar: "أساتذتنا",
    en: "Our Professors",
    es: "Nuestros Profesores",
  },
  "professors.meetButton": {
    ar: "تعرف على الأستاذ",
    en: "Meet the Professor",
    es: "Conoce al Profesor",
  },
  "professors.viewAll": {
    ar: "عرض جميع الأساتذة",
    en: "View All Professors",
    es: "Ver Todos los Profesores",
  },
  "professors.backToList": {
    ar: "العودة إلى قائمة الأساتذة",
    en: "Back to Professors List",
    es: "Volver a la Lista de Profesores",
  },
  "professors.contactViaWhatsApp": {
    ar: "تواصل مع الأستاذ عبر الواتساب",
    en: "Contact Professor via WhatsApp",
    es: "Contactar al Profesor por WhatsApp",
  },
  "professors.notFound": {
    ar: "الأستاذ غير موجود",
    en: "Professor not found",
    es: "Profesor no encontrado",
  },
  // Teachers page (fixing the missing translation)
  "teachers.title": {
    ar: "أساتذتنا",
    en: "Our Teachers",
    es: "Nuestros Profesores",
  },
  // Registration Page
  "register.title": {
    ar: "التسجيل في الدورات",
    en: "Course Registration",
    es: "Registro de Cursos",
  },
  "register.description": {
    ar: "املأ النموذج أدناه للتسجيل في إحدى دوراتنا اللغوية. سيتواصل معك فريقنا في أقرب وقت ممكن لتأكيد التسجيل وترتيب مواعيد الدروس.",
    en: "Fill out the form below to register for one of our language courses. Our team will contact you as soon as possible to confirm registration and arrange lesson times.",
    es: "Complete el formulario a continuación para registrarse en uno de nuestros cursos de idiomas. Nuestro equipo se pondrá en contacto con usted lo antes posible para confirmar el registro y organizar los horarios de las clases.",
  },
  "register.paymentMethod.card": {
    ar: "تسجيل",
    en: "Register",
    es: "Registro",
  },
  "register.paymentMethod.bank": {
    ar: "تحويل بنكي",
    en: "Bank Transfer",
    es: "Transferencia Bancaria",
  },
  "register.bankTransfer.title": {
    ar: "بإمكانك الدفع مسبقا",
    en: "You can pay in advance",
    es: "Puede pagar por adelantado",
  },
  "register.bankTransfer.instruction": {
    ar: "عبر الإرسال لأحد البنوك أسفله",
    en: "Via transfer to one of the banks below",
    es: "Mediante transferencia a uno de los bancos siguientes",
  },
  "register.bankTransfer.baridBank": {
    ar: "عبر BARID BANK",
    en: "Via BARID BANK",
    es: "A través de BARID BANK",
  },
  "register.bankTransfer.cihBank": {
    ar: "عبر CIH BANK",
    en: "Via CIH BANK",
    es: "A través de CIH BANK",
  },
  "register.bankTransfer.accountHolder": {
    ar: "صاحب الحساب",
    en: "Account Holder",
    es: "Titular de la cuenta",
  },
  "register.bankTransfer.contactAfter": {
    ar: "بعد إتمام التحويل، يرجى التواصل معنا عبر واتساب لتأكيد تسجيلك",
    en: "After completing the transfer, please contact us via WhatsApp to confirm your registration",
    es: "Después de completar la transferencia, contáctenos a través de WhatsApp para confirmar su registro",
  },
  "register.bankTransfer.contactWhatsApp": {
    ar: "تواصل معنا عبر واتساب",
    en: "Contact us via WhatsApp",
    es: "Contáctenos por WhatsApp",
  },
  "register.form.title": {
    ar: "سجل الآن",
    en: "Register Now",
    es: "Regístrate Ahora",
  },
  "register.form.personalInfo": {
    ar: "المعلومات الشخصية",
    en: "Personal Information",
    es: "Información Personal",
  },
  "register.form.courseInfo": {
    ar: "معلومات الدورة",
    en: "Course Information",
    es: "Información del Curso",
  },
  // Form Fields
  "form.fullName": {
    ar: "الاسم الكامل",
    en: "Full Name",
    es: "Nombre Completo",
  },
  "form.fullNamePlaceholder": {
    ar: "الاسم و النسب",
    en: "First and Last Name",
    es: "Nombre y Apellido",
  },
  "form.age": {
    ar: "العمر",
    en: "Age",
    es: "Edad",
  },
  "form.agePlaceholder": {
    ar: "العمر",
    en: "Age",
    es: "Edad",
  },
  "form.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
    es: "Correo Electrónico",
  },
  "form.emailPlaceholder": {
    ar: "البريد الإلكتروني",
    en: "Email Address",
    es: "Dirección de Correo Electrónico",
  },
  "form.phone": {
    ar: "الهاتف",
    en: "Phone",
    es: "Teléfono",
  },
  "form.phonePlaceholder": {
    ar: "الهاتف",
    en: "Phone Number",
    es: "Número de Teléfono",
  },
  "form.selectLevel": {
    ar: "حدد المستوى",
    en: "Select Level",
    es: "Seleccionar Nivel",
  },
  "form.chooseLevelPlaceholder": {
    ar: "اختر المستوى",
    en: "Choose Level",
    es: "Elegir Nivel",
  },
  "level.beginner": {
    ar: "مبتدئ",
    en: "Beginner",
    es: "Principiante",
  },
  "level.intermediate": {
    ar: "متوسط",
    en: "Intermediate",
    es: "Intermedio",
  },
  "level.advanced": {
    ar: "متقدم",
    en: "Advanced",
    es: "Avanzado",
  },
  "form.selectLanguage": {
    ar: "حدد اللغة",
    en: "Select Language",
    es: "Seleccionar Idioma",
  },
  "form.chooseLanguagePlaceholder": {
    ar: "اختر اللغة",
    en: "Choose Language",
    es: "Elegir Idioma",
  },
  "form.selectSubscription": {
    ar: "حدد اشتراكك",
    en: "Select Subscription",
    es: "Seleccionar Suscripción",
  },
  "form.chooseSubscriptionPlaceholder": {
    ar: "اختر نوع الاشتراك",
    en: "Choose Subscription Type",
    es: "Elegir Tipo de Suscripción",
  },
  "subscription.individual": {
    ar: "فردي",
    en: "Individual",
    es: "Individual",
  },
  "subscription.group": {
    ar: "جماعي",
    en: "Group",
    es: "Grupo",
  },
  "subscription.online": {
    ar: "عبر الإنترنت",
    en: "Online",
    es: "En línea",
  },
  "form.paymentMethod": {
    ar: "طريقة الدفع",
    en: "Payment Method",
    es: "Método de Pago",
  },
  "form.creditCard": {
    ar: "بطاقة ائتمان",
    en: "Credit Card",
    es: "Tarjeta de Crédito",
  },
  // Notifications
  "notifications.registrationSuccess": {
    ar: "تم إرسال طلب التسجيل بنجاح",
    en: "Registration request sent successfully",
    es: "Solicitud de registro enviada con éxito",
  },
  "notifications.contactSoon": {
    ar: "سنتواصل معك قريبًا لتأكيد التسجيل",
    en: "We will contact you soon to confirm registration",
    es: "Nos pondremos en contacto contigo pronto para confirmar el registro",
  },
  "notifications.error": {
    ar: "حدث خطأ",
    en: "An error occurred",
    es: "Se produjo un error",
  },
  "notifications.tryAgain": {
    ar: "يرجى المحاولة مرة أخرى",
    en: "Please try again",
    es: "Inténtalo de nuevo",
  },
  "whatsapp.newRegistration": {
    ar: "طلب تسجيل جديد",
    en: "New registration request",
    es: "Nueva solicitud de registro",
  },
  // Languages Page
  "languages.pageTitle": {
    ar: "اللغات المتوفرة",
    en: "Available Languages",
    es: "Idiomas Disponibles",
  },
  "languages.learnWith": {
    ar: "تعلم {language} مع أفضل الأساتذة المتخصصين. دورات لجميع المستويات من المبتدئ إلى المتقدم.",
    en: "Learn {language} with the best specialized professors. Courses for all levels from beginner to advanced.",
    es: "Aprende {language} con los mejores profesores especializados. Cursos para todos los niveles desde principiante hasta avanzado.",
  },
  "button.inquiry": {
    ar: "استفسار",
    en: "Inquiry",
    es: "Consulta",
  },
  // Contact Page
  "contact.title": {
    ar: "تواصل معنا",
    en: "Contact Us",
    es: "Contáctanos",
  },
  "contact.description": {
    ar: "نحن هنا للإجابة على جميع استفساراتك. يمكنك التواصل معنا عبر إحدى الطرق التالية.",
    en: "We are here to answer all your inquiries. You can contact us through one of the following methods.",
    es: "Estamos aquí para responder a todas sus consultas. Puede contactarnos a través de uno de los siguientes métodos.",
  },
  "contact.methods": {
    ar: "وسائل الاتصال",
    en: "Contact Methods",
    es: "Métodos de Contacto",
  },
  "contact.phone": {
    ar: "الهاتف",
    en: "Phone",
    es: "Teléfono",
  },
  "contact.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
    es: "Correo Electrónico",
  },
  "contact.address": {
    ar: "العنوان",
    en: "Address",
    es: "Dirección",
  },
  "contact.whatsapp": {
    ar: "واتساب",
    en: "WhatsApp",
    es: "WhatsApp",
  },
  "contact.whatsapp.desc": {
    ar: "يمكنك التواصل معنا مباشرة عبر واتساب للحصول على رد سريع",
    en: "You can contact us directly via WhatsApp for a quick response",
    es: "Puede contactarnos directamente a través de WhatsApp para obtener una respuesta rápida",
  },
  "button.whatsapp": {
    ar: "مراسلة عبر واتساب",
    en: "Message via WhatsApp",
    es: "Mensaje por WhatsApp",
  },
  // Footer
  "footer.description": {
    ar: "نقدم دورات لغوية عالية الجودة بأسعار معقولة. نؤمن بأن تعلم لغة جديدة يجب أن يكون متاحًا للجميع.",
    en: "We offer high quality language courses at reasonable prices. We believe that learning a new language should be accessible to everyone.",
    es: "Ofrecemos cursos de idiomas de alta calidad a precios razonables. Creemos que aprender un nuevo idioma debe ser accesible para todos.",
  },
  "footer.quickLinks": {
    ar: "روابط سريعة",
    en: "Quick Links",
    es: "Enlaces Rápidos",
  },
  "footer.contactUs": {
    ar: "تواصل معنا",
    en: "Contact Us",
    es: "Contáctanos",
  },
  "footer.copyright": {
    ar: "© {year} أكاديمية اللغات. جميع الحقوق محفوظة",
    en: "© {year} Language Academy. All Rights Reserved",
    es: "© {year} Academia de Idiomas. Todos los derechos reservados",
  },
  // WhatsApp Page
  "whatsapp.title": {
    ar: "تواصل معنا عبر واتساب",
    en: "Contact Us via WhatsApp",
    es: "Contáctanos por WhatsApp",
  },
  "whatsapp.description": {
    ar: "يمكنك التواصل معنا بسهولة عبر واتساب للاستفسار عن الدورات اللغوية أو للتسجيل في دورة معينة.",
    en: "You can easily contact us via WhatsApp to inquire about language courses or to register for a specific course.",
    es: "Puedes contactarnos fácilmente a través de WhatsApp para preguntar sobre cursos de idiomas o para registrarte en un curso específico.",
  },
  "whatsapp.form.title": {
    ar: "تواصل معنا عبر واتساب",
    en: "Contact Us via WhatsApp",
    es: "Contáctanos por WhatsApp",
  },
  "whatsapp.form.name": {
    ar: "الاسم",
    en: "Name",
    es: "Nombre",
  },
  "whatsapp.form.message": {
    ar: "الرسالة",
    en: "Message",
    es: "Mensaje",
  },
  "whatsapp.form.send": {
    ar: "إرسال عبر الواتساب",
    en: "Send via WhatsApp",
    es: "Enviar por WhatsApp",
  },
  "whatsapp.form.sending": {
    ar: "جاري الإرسال...",
    en: "Sending...",
    es: "Enviando...",
  },
  "whatsapp.form.hint": {
    ar: "سيتم فتح تطبيق واتساب تلقائيًا بعد الضغط على الزر",
    en: "WhatsApp will open automatically after clicking the button",
    es: "WhatsApp se abrirá automáticamente después de hacer clic en el botón",
  },
  // WhatsApp Float Button
  "whatsapp.float.title": {
    ar: "تحدث معنا",
    en: "Chat with us",
    es: "Chatea con nosotros",
  },
  "whatsapp.float.subtitle": {
    ar: "نحن هنا للمساعدة!",
    en: "We're here to help!",
    es: "¡Estamos aquí para ayudar!",
  },
  "whatsapp.float.greeting": {
    ar: "مرحباً! 👋 كيف يمكننا مساعدتك اليوم؟",
    en: "Hi there! 👋 How can we help you today?",
    es: "¡Hola! 👋 ¿Cómo podemos ayudarte hoy?",
  },
  "whatsapp.float.replyTime": {
    ar: "عادة ما نرد فوراً",
    en: "Typically replies instantly",
    es: "Normalmente responde al instante",
  },
  "whatsapp.float.startChat": {
    ar: "بدء المحادثة",
    en: "Start Chat",
    es: "Iniciar Chat",
  },
  "whatsapp.float.clickToChat": {
    ar: "اضغط للدردشة على الواتساب",
    en: "Click to chat on WhatsApp",
    es: "Haz clic para chatear en WhatsApp",
  },
  "whatsapp.float.tooltip": {
    ar: "تحدث معنا على الواتساب",
    en: "Chat with us on WhatsApp",
    es: "Chatea con nosotros en WhatsApp",
  },
  // Error/NotFound Page
  "404.title": {
    ar: "404",
    en: "404",
    es: "404",
  },
  "404.message": {
    ar: "عذراً، الصفحة غير موجودة",
    en: "Sorry, page not found",
    es: "Lo sentimos, página no encontrada",
  },
  "404.button": {
    ar: "العودة إلى الصفحة الرئيسية",
    en: "Return to Home Page",
    es: "Volver a la Página Principal",
  },
  // Loading states
  "loading.general": {
    ar: "جاري التحميل...",
    en: "Loading...",
    es: "Cargando...",
  },
  "loading.teachers": {
    ar: "جاري تحميل المدرسين...",
    en: "Loading teachers...",
    es: "Cargando profesores...",
  },
  "loading.languages": {
    ar: "جاري تحميل اللغات...",
    en: "Loading languages...",
    es: "Cargando idiomas...",
  },
  // Error states
  "error.general": {
    ar: "حدث خطأ في التحميل",
    en: "Loading error occurred",
    es: "Ocurrió un error de carga",
  },
  "error.retry": {
    ar: "إعادة المحاولة",
    en: "Retry",
    es: "Reintentar",
  },
  // Common actions
  "action.viewMore": {
    ar: "عرض المزيد",
    en: "View More",
    es: "Ver Más",
  },
  "action.viewLess": {
    ar: "عرض أقل",
    en: "View Less",
    es: "Ver Menos",
  },
  "action.close": {
    ar: "إغلاق",
    en: "Close",
    es: "Cerrar",
  },
  "action.save": {
    ar: "حفظ",
    en: "Save",
    es: "Guardar",
  },
  "action.edit": {
    ar: "تعديل",
    en: "Edit",
    es: "Editar",
  },
  "action.delete": {
    ar: "حذف",
    en: "Delete",
    es: "Eliminar",
  },
  "action.confirm": {
    ar: "تأكيد",
    en: "Confirm",
    es: "Confirmar",
  },
  // Status messages
  "status.success": {
    ar: "تم بنجاح",
    en: "Success",
    es: "Éxito",
  },
  "status.failed": {
    ar: "فشل",
    en: "Failed",
    es: "Falló",
  },
  "status.pending": {
    ar: "في الانتظار",
    en: "Pending",
    es: "Pendiente",
  },
  "status.completed": {
    ar: "مكتمل",
    en: "Completed",
    es: "Completado",
  },
  // Time and dates
  "time.today": {
    ar: "اليوم",
    en: "Today",
    es: "Hoy",
  },
  "time.yesterday": {
    ar: "أمس",
    en: "Yesterday",
    es: "Ayer",
  },
  "time.tomorrow": {
    ar: "غداً",
    en: "Tomorrow",
    es: "Mañana",
  },
  "time.week": {
    ar: "أسبوع",
    en: "Week",
    es: "Semana",
  },
  "time.month": {
    ar: "شهر",
    en: "Month",
    es: "Mes",
  },
  "time.year": {
    ar: "سنة",
    en: "Year",
    es: "Año",
  },
  // Admin Login Page
  "admin.login.title": {
    ar: "تسجيل الدخول للوحة التحكم",
    en: "Admin Panel Login",
    es: "Inicio de Sesión del Panel de Administración",
  },
  "admin.login.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
    es: "Correo Electrónico",
  },
  "admin.login.password": {
    ar: "كلمة المرور",
    en: "Password",
    es: "Contraseña",
  },
  "admin.login.emailPlaceholder": {
    ar: "أدخل البريد الإلكتروني",
    en: "Enter email address",
    es: "Ingrese dirección de correo electrónico",
  },
  "admin.login.passwordPlaceholder": {
    ar: "أدخل كلمة المرور",
    en: "Enter password",
    es: "Ingrese contraseña",
  },
  "admin.login.button": {
    ar: "تسجيل الدخول",
    en: "Login",
    es: "Iniciar Sesión",
  },
  "admin.login.loading": {
    ar: "جاري تسجيل الدخول...",
    en: "Logging in...",
    es: "Iniciando sesión...",
  },
  "admin.login.demo": {
    ar: "لتسجيل الدخول التجريبي: admin@example.com / admin123",
    en: "For demo login: admin@example.com / admin123",
    es: "Para inicio de sesión de demostración: admin@example.com / admin123",
  },
  // Teacher Detail Page
  "teacher.specializations": {
    ar: "التخصصات",
    en: "Specializations",
    es: "Especializaciones",
  },
  "teacher.qualification": {
    ar: "المؤهل العلمي",
    en: "Qualification",
    es: "Cualificación",
  },
  "teacher.experience": {
    ar: "سنوات الخبرة",
    en: "Years of Experience",
    es: "Años de Experiencia",
  },
  "teacher.experienceYears": {
    ar: "{years} سنة",
    en: "{years} years",
    es: "{years} años",
  },
  "teacher.bio": {
    ar: "نبذة عن المدرس",
    en: "About the Teacher",
    es: "Acerca del Profesor",
  },
  "teacher.defaultBio": {
    ar: "مدرس متخصص في تدريس اللغات",
    en: "Specialized language teacher",
    es: "Profesor especializado en idiomas",
  },
  "teacher.defaultExperience": {
    ar: "خبرة واسعة في التدريس",
    en: "Extensive teaching experience",
    es: "Amplia experiencia docente",
  },
  // Quiz translations
  "quiz.availableQuizzes": {
    ar: "الاختبارات المتاحة",
    en: "Available Quizzes",
    es: "Cuestionarios Disponibles",
  },
  "quiz.searchPlaceholder": {
    ar: "البحث في الاختبارات...",
    en: "Search quizzes...",
    es: "Buscar cuestionarios...",
  },
  "quiz.available": {
    ar: "متاح",
    en: "Available",
    es: "Disponible",
  },
  "quiz.unavailable": {
    ar: "غير متاح",
    en: "Unavailable",
    es: "No disponible",
  },
  "quiz.questions": {
    ar: "سؤال",
    en: "questions",
    es: "preguntas",
  },
  "quiz.minutes": {
    ar: "دقيقة",
    en: "minutes",
    es: "minutos",
  },
  "quiz.unlimited": {
    ar: "غير محدود",
    en: "Unlimited",
    es: "Ilimitado",
  },
  "quiz.passingScore": {
    ar: "للنجاح",
    en: "to pass",
    es: "para aprobar",
  },
  "quiz.attempts": {
    ar: "محاولة",
    en: "attempts",
    es: "intentos",
  },
  "quiz.previousAttempts": {
    ar: "المحاولات السابقة:",
    en: "Previous attempts:",
    es: "Intentos anteriores:",
  },
  "quiz.attempt": {
    ar: "المحاولة",
    en: "Attempt",
    es: "Intento",
  },
  "quiz.startQuiz": {
    ar: "بدء الاختبار",
    en: "Start Quiz",
    es: "Iniciar Cuestionario",
  },
  "quiz.attemptsExhausted": {
    ar: "تم استنفاد المحاولات",
    en: "Attempts exhausted",
    es: "Intentos agotados",
  },
  "quiz.results": {
    ar: "النتائج",
    en: "Results",
    es: "Resultados",
  },
  "quiz.noQuizzesAvailable": {
    ar: "لا توجد اختبارات متاحة حالياً",
    en: "No quizzes available currently",
    es: "No hay cuestionarios disponibles actualmente",
  },
  "quiz.notFound": {
    ar: "الاختبار غير موجود",
    en: "Quiz not found",
    es: "Cuestionario no encontrado",
  },
  "quiz.backToQuizzes": {
    ar: "العودة إلى الاختبارات",
    en: "Back to Quizzes",
    es: "Volver a Cuestionarios",
  },
  "quiz.questionsCount": {
    ar: "عدد الأسئلة",
    en: "Number of Questions",
    es: "Número de Preguntas",
  },
  "quiz.passingGrade": {
    ar: "درجة النجاح",
    en: "Passing Grade",
    es: "Calificación de Aprobación",
  },
  "quiz.timeLimit": {
    ar: "المدة الزمنية",
    en: "Time Limit",
    es: "Límite de Tiempo",
  },
  "quiz.attemptsAllowed": {
    ar: "محاولة متاحة",
    en: "attempts allowed",
    es: "intentos permitidos",
  },
  "quiz.importantInstructions": {
    ar: "تعليمات مهمة:",
    en: "Important Instructions:",
    es: "Instrucciones Importantes:",
  },
  "quiz.instruction1": {
    ar: "• اقرأ كل سؤال بعناية قبل الإجابة",
    en: "• Read each question carefully before answering",
    es: "• Lee cada pregunta cuidadosamente antes de responder",
  },
  "quiz.instruction2": {
    ar: "• يمكنك التنقل بين الأسئلة والعودة لتعديل إجاباتك",
    en: "• You can navigate between questions and return to modify your answers",
    es: "• Puedes navegar entre preguntas y volver para modificar tus respuestas",
  },
  "quiz.instruction3": {
    ar: "• لديك {minutes} دقيقة لإكمال الاختبار",
    en: "• You have {minutes} minutes to complete the quiz",
    es: "• Tienes {minutes} minutos para completar el cuestionario",
  },
  "quiz.instruction4": {
    ar: "• تأكد من الإجابة على جميع الأسئلة قبل التسليم",
    en: "• Make sure to answer all questions before submitting",
    es: "• Asegúrate de responder todas las preguntas antes de enviar",
  },
  "quiz.instruction5": {
    ar: "• لا يمكن العودة للاختبار بعد التسليم",
    en: "• You cannot return to the quiz after submission",
    es: "• No puedes volver al cuestionario después de enviarlo",
  },
  "quiz.startQuizButton": {
    ar: "بدء الاختبار",
    en: "Start Quiz",
    es: "Iniciar Cuestionario",
  },
  "quiz.starting": {
    ar: "جاري البدء...",
    en: "Starting...",
    es: "Iniciando...",
  },
  "quiz.question": {
    ar: "السؤال",
    en: "Question",
    es: "Pregunta",
  },
  "quiz.of": {
    ar: "من",
    en: "of",
    es: "de",
  },
  "quiz.answered": {
    ar: "مجاب",
    en: "answered",
    es: "respondidas",
  },
  "quiz.points": {
    ar: "نقطة",
    en: "points",
    es: "puntos",
  },
  "quiz.previousQuestion": {
    ar: "السؤال السابق",
    en: "Previous Question",
    es: "Pregunta Anterior",
  },
  "quiz.nextQuestion": {
    ar: "السؤال التالي",
    en: "Next Question",
    es: "Siguiente Pregunta",
  },
  "quiz.submitQuiz": {
    ar: "تسليم الاختبار",
    en: "Submit Quiz",
    es: "Enviar Cuestionario",
  },
  "quiz.confirmSubmission": {
    ar: "تأكيد التسليم",
    en: "Confirm Submission",
    es: "Confirmar Envío",
  },
  "quiz.submissionConfirmation": {
    ar: "هل أنت متأكد من تسليم الاختبار؟ لقد أجبت على {answered} من {total} أسئلة. لا يمكن العودة للاختبار بعد التسليم.",
    en: "Are you sure you want to submit the quiz? You have answered {answered} out of {total} questions. You cannot return to the quiz after submission.",
    es: "¿Estás seguro de que quieres enviar el cuestionario? Has respondido {answered} de {total} preguntas. No puedes volver al cuestionario después del envío.",
  },
  "quiz.reviewAnswers": {
    ar: "مراجعة الإجابات",
    en: "Review Answers",
    es: "Revisar Respuestas",
  },
  "quiz.writeAnswerHere": {
    ar: "اكتب إجابتك هنا...",
    en: "Write your answer here...",
    es: "Escribe tu respuesta aquí...",
  },
  // Quiz Results
  "quiz.quizResults": {
    ar: "نتائج الاختبار",
    en: "Quiz Results",
    es: "Resultados del Cuestionario",
  },
  "quiz.passed": {
    ar: "نجحت في الاختبار!",
    en: "You passed the quiz!",
    es: "¡Aprobaste el cuestionario!",
  },
  "quiz.failed": {
    ar: "لم تنجح في الاختبار",
    en: "You did not pass the quiz",
    es: "No aprobaste el cuestionario",
  },
  "quiz.scoreEarned": {
    ar: "النقاط المحصلة",
    en: "Score Earned",
    es: "Puntuación Obtenida",
  },
  "quiz.correctAnswers": {
    ar: "إجابات صحيحة",
    en: "Correct Answers",
    es: "Respuestas Correctas",
  },
  "quiz.timeTaken": {
    ar: "الوقت المستغرق",
    en: "Time Taken",
    es: "Tiempo Tomado",
  },
  "quiz.requiredGrade": {
    ar: "المطلوبة",
    en: "Required",
    es: "Requerida",
  },
  "quiz.detailedResults": {
    ar: "تفاصيل الإجابات",
    en: "Detailed Results",
    es: "Resultados Detallados",
  },
  "quiz.yourAnswer": {
    ar: "إجابتك",
    en: "Your Answer",
    es: "Tu Respuesta",
  },
  "quiz.correctAnswer": {
    ar: "الإجابة الصحيحة",
    en: "Correct Answer",
    es: "Respuesta Correcta",
  },
  "quiz.explanation": {
    ar: "التفسير:",
    en: "Explanation:",
    es: "Explicación:",
  },
  "quiz.retryQuiz": {
    ar: "إعادة المحاولة",
    en: "Retry Quiz",
    es: "Reintentar Cuestionario",
  },
  "quiz.resultsNotAvailable": {
    ar: "النتائج غير متاحة",
    en: "Results not available",
    es: "Resultados no disponibles",
  },
  // Student Dashboard
  "student.dashboard": {
    ar: "لوحة تحكم الطالب",
    en: "Student Dashboard",
    es: "Panel del Estudiante",
  },
  "student.welcome": {
    ar: "مرحباً بك في منصة التعلم",
    en: "Welcome to the learning platform",
    es: "Bienvenido a la plataforma de aprendizaje",
  },
  "student.quizzes": {
    ar: "الاختبارات",
    en: "Quizzes",
    es: "Cuestionarios",
  },
  "student.quizzesDesc": {
    ar: "عرض الاختبارات المتاحة وإجراء الاختبارات",
    en: "View available quizzes and take quizzes",
    es: "Ver cuestionarios disponibles y realizar cuestionarios",
  },
  "student.programs": {
    ar: "البرامج",
    en: "Programs",
    es: "Programas",
  },
  "student.programsDesc": {
    ar: "عرض البرامج المسجل بها",
    en: "View enrolled programs",
    es: "Ver programas inscritos",
  },
  "student.liveSessions": {
    ar: "الجلسات المباشرة",
    en: "Live Sessions",
    es: "Sesiones en Vivo",
  },
  "student.liveSessionsDesc": {
    ar: "الانضمام إلى الجلسات المباشرة",
    en: "Join live sessions",
    es: "Unirse a sesiones en vivo",
  },
  "student.resultsDesc": {
    ar: "عرض نتائج الاختبارات والتقييمات",
    en: "View quiz results and assessments",
    es: "Ver resultados de cuestionarios y evaluaciones",
  },
  "student.recentActivity": {
    ar: "النشاط الأخير",
    en: "Recent Activity",
    es: "Actividad Reciente",
  },
  "student.noRecentActivity": {
    ar: "لا يوجد نشاط حديث",
    en: "No recent activity",
    es: "No hay actividad reciente",
  },
  "student.quickLinks": {
    ar: "روابط سريعة",
    en: "Quick Links",
    es: "Enlaces Rápidos",
  },
  "student.availableQuizzes": {
    ar: "الاختبارات المتاحة",
    en: "Available Quizzes",
    es: "Cuestionarios Disponibles",
  },
  "student.myPrograms": {
    ar: "برامجي",
    en: "My Programs",
    es: "Mis Programas",
  },
  "student.statistics": {
    ar: "الإحصائيات",
    en: "Statistics",
    es: "Estadísticas",
  },
  "student.completedQuizzes": {
    ar: "الاختبارات المكتملة",
    en: "Completed Quizzes",
    es: "Cuestionarios Completados",
  },
  "student.enrolledPrograms": {
    ar: "البرامج المسجل بها",
    en: "Enrolled Programs",
    es: "Programas Inscritos",
  },
  "student.averageGrade": {
    ar: "متوسط الدرجات",
    en: "Average Grade",
    es: "Calificación Promedio",
  },
  "student.goTo": {
    ar: "الانتقال",
    en: "Go to",
    es: "Ir a",
  },
  // Toast messages
  "toast.quizStarted": {
    ar: "تم بدء الاختبار",
    en: "Quiz started",
    es: "Cuestionario iniciado",
  },
  "toast.quizStartedDesc": {
    ar: "بدأ الاختبار بنجاح. حظاً موفقاً!",
    en: "Quiz started successfully. Good luck!",
    es: "Cuestionario iniciado con éxito. ¡Buena suerte!",
  },
  "toast.quizSubmitted": {
    ar: "تم تسليم الاختبار",
    en: "Quiz submitted",
    es: "Cuestionario enviado",
  },
  "toast.quizSubmittedDesc": {
    ar: "تم تسليم الاختبار بنجاح",
    en: "Quiz submitted successfully",
    es: "Cuestionario enviado con éxito",
  },
  "toast.error": {
    ar: "خطأ",
    en: "Error",
    es: "Error",
  },
  "toast.quizStartError": {
    ar: "حدث خطأ أثناء بدء الاختبار",
    en: "An error occurred while starting the quiz",
    es: "Ocurrió un error al iniciar el cuestionario",
  },
  "toast.quizSubmitError": {
    ar: "حدث خطأ أثناء تسليم الاختبار",
    en: "An error occurred while submitting the quiz",
    es: "Ocurrió un error al enviar el cuestionario",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    // Get language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
    return savedLanguage && ['ar', 'en', 'es'].includes(savedLanguage) ? savedLanguage : 'ar';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]['ar'] || key;
  };

  // Determine text direction based on language
  const getDirection = (lang: SupportedLanguage): 'rtl' | 'ltr' => {
    return lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Direction based on language
  const dir = getDirection(language);

  // Apply direction to HTML element
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Add appropriate class for text alignment based on direction
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};