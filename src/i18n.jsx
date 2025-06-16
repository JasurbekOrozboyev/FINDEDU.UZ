import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; 

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['uz', 'ru', 'eng'], 
    fallbackLng: 'uz',
    debug: true, 
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      uz: {
        translation: {
          "home": "Bosh sahifa",
          "about": "Biz haqimizda",
          "resources": "Resurslar",
          "education": "TA'LIM", 

          "favorites": "Sevimlilar",
          "appointments": "Uchrashuvlar",
          "editProfile": "Profilni tahrirlash",
          "logout": "Chiqish",
          "login": "Kirish",
          "register": "Ro'yxatdan o'tish",
          "uzbekLanguage": "O'zbek tili",
          "russianLanguage": "Русский",
          "englishLanguage": "English",
          "lightMode": "Yorug' rejim",
          "darkMode": "Tungi rejim",
          "close": "Yopish",
          "myCourses": "Mening kurslarim",
          "activeCourses": "Faol kurslar",
          "finishedCourses": "Tugallangan kurslar",
          "certificates": "Sertifikatlar",
          "settings": "Sozlamalar",
          "headerTitle": "Bir qidiruv - cheksiz imkoniyatlar", 
          "headerDescription": "Biz talabalarga dunyo bo'ylab eng yaxshi kurslar, markazlar va ta'lim imkoniyatlarini topishda yordam beramiz. Mutaxassislarning tavsiyalari va talabalarning haqiqiy sharhlari bilan ta'lim safaringizni osonlashtiramiz." 
        }
      },
      ru: {
        translation: {
          "home": "Главная",
          "about": "О нас",
          "resources": "Ресурсы",
          "education": "ОБРАЗОВАНИЕ",

          "favorites": "Избранное",
          "appointments": "Записи",
          "editProfile": "Редактировать профиль",
          "logout": "Выйти",
          "login": "Войти",
          "register": "Зарегистрироваться",

          "uzbekLanguage": "Узбекский язык", 
          "russianLanguage": "Русский",
          "englishLanguage": "Английский",

          "lightMode": "Светлый режим",
          "darkMode": "Темный режим",

          "close": "Закрыть",

          "myCourses": "Мои курсы",
          "activeCourses": "Активные курсы",
          "finishedCourses": "Завершенные курсы",
          "certificates": "Сертификаты",
          "settings": "Настройки",
          "headerTitle": "Один поиск - безграничные возможности", 
          "headerDescription": "Мы помогаем студентам найти лучшие курсы, центры и образовательные возможности по всему миру. С рекомендациями экспертов и реальными отзывами студентов мы упрощаем ваш образовательный путь." 
        }
      },
      eng: {
        translation: {
          "home": "Home",
          "about": "About",
          "resources": "Resources",
          "education": "EDUCATION",

          "favorites": "Favorites",
          "appointments": "Appointments",
          "editProfile": "Edit Profile",
          "logout": "Logout",
          "login": "Login",
          "register": "Register",

          "uzbekLanguage": "O'zbek tili", 
          "russianLanguage": "Русский",
          "englishLanguage": "English",

          "lightMode": "Light Mode",
          "darkMode": "Dark Mode",

          "close": "Close",

          "myCourses": "My Courses",
          "activeCourses": "Active Courses",
          "finishedCourses": "Finished Courses",
          "certificates": "Certificates",
          "settings": "Settings",
          "headerTitle": "One search - endless possibilities", 
          "headerDescription": "We help students discover the best courses, centers, and educational opportunities worldwide. With expert recommendations and genuine student reviews, we simplify your educational journey." 
        }
      }
    }
  });

export default i18n;