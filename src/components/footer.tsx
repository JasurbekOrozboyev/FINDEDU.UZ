import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTelegram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next'; 

function Footer() {
    const { t } = useTranslation(); 

    return (
        <div className="w-full bg-[#461773] text-white py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm sm:text-base">
                <ul className="flex flex-col gap-2">
                    <li>{t('home')}</li> 
                    <li>{t('educationCenters')}</li> 
                    <li>{t('aboutUs')}</li> 
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>{t('contact')}</li> 
                    <li>{t('reviews')}</li> 
                    <li>{t('projects')}</li> 
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>{t('it')}</li> 
                    <li>{t('mathematics')}</li> 
                    <li>{t('marketing')}</li> 
                    <li>{t('sat')}</li> 
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>{t('englishLanguage')}</li> 
                    <li>{t('smm')}</li> 
                    <li>{t('design')}</li> s
                    <li>{t('business')}</li> 
                </ul>
            </div>

            <div className="max-w-[1000px] mx-auto mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                <div>
                    <p className="text-xs sm:text-sm">{t('copyright')}</p> 
                </div>
                <ul className="flex flex-wrap justify-center sm:justify-end items-center gap-x-5 gap-y-2 text-xl sm:text-2xl">
                    <li><FontAwesomeIcon icon={faFacebook} /></li>
                    <li><FontAwesomeIcon icon={faInstagram} /></li>
                    <li><FontAwesomeIcon icon={faTelegram} /></li>
                    <li><FontAwesomeIcon icon={faYoutube} /></li>
                </ul>
            </div>
        </div>
    );
}

export default Footer;