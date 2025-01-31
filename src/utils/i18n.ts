import i18next from "i18next";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";
i18next.init({
    lng: "en",
    resources: {
        en: {
            translation: en
        },
        zh: {
            translation: zh
        }
    },
    interpolation: {
        escapeValue: false
    }
});
(globalThis as any).i = i18next.t;