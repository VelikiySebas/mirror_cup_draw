/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: '#1C1C1C',
        textColor: '#FFE9D4',
        boardColor: 'rgb(255, 121, 91)',
        secondTextColor: 'rgb(139, 194, 202)',
        thirdTextColor: '#A0D892'
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1280px',
        xl: '1440px',
      },
      fontFamily: {
        'zekton': ['Zekton']
      },
      boxShadow: {
          'boardShadow' : '0px 7px 16px 0px rgba(255, 121, 91, 0.29),0px 29px 29px 0px rgba(255, 121, 91, 0.26),0px 66px 39px 0px rgba(255, 121, 91, 0.15),0px 117px 47px 0px rgba(255, 121, 91, 0.04),0px 182px 51px 0px rgba(255, 121, 91, 0.01)'
      }
      
  },
  },

}