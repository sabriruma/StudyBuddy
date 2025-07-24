export default function Hero({ onGetStarted }) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Find your perfect <span className="text-green-500 dark:text-green-400">study partner</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500 dark:text-gray-400">
          Connect with students who share your academic goals and learning style.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <button 
            onClick={onGetStarted}
            className="bg-green-500 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-3 border border-transparent rounded-md text-base font-medium"
          >
            Get Started
          </button>
          <a
            href="#how-it-works"
            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-indigo-500 dark:text-indigo-400 px-8 py-3 border border-indigo-500 dark:border-indigo-400 rounded-md text-base font-medium"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  )
}