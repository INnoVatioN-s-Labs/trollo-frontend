import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko.json';
import en from './locales/en.json';

const resources = {
    ko: { translation: ko },
    en: { translation: en },
};

i18n.use(LanguageDetector) // 브라우저 언어 감지
    .use(initReactI18next) // React-i18next 연동
    .init({
        resources,
        fallbackLng: 'en', // 지원하지 않는 언어일 경우 영어로 폴백
        // 디폴트 값을 'ko'로 고정하고 싶을 땐 아래 옵션 활성화하지만, languagedetector+fallbackLng 조합으로 한국어 환경에선 자동 ko 렌더됨
        // lng: 'ko',
        interpolation: {
            escapeValue: false, // React는 내부적으로 XSS 방어 기능을 하므로 false 처리
        },
    });

export default i18n;
