import { useTranslation } from 'react-i18next'; 

function Headers(){
    const { t } = useTranslation(); 

    return(
        <div>
            <div 
                className="min-h-screen bg-center bg-no-repeat bg-cover flex flex-col justify-center items-center text-center p-4 sm:p-8 md:p-15"
                style={{ backgroundImage: "url('/bg.png')" }}>
                <div className="w-full max-w-4xl text-[#461773] flex flex-col items-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mt-5 leading-tight">
                        {t('headerTitle')} 
                    </h1>
                    <p className="w-full mt-3 text-base sm:text-lg max-w-2xl">
                        {t('headerDescription')} 
                    </p>
                </div>
            </div>
            <section>
            </section>
        </div>
    )
}
export default Headers;