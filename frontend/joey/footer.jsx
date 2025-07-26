export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">StudyBuddy</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white dark:hover:text-gray-300">About</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white dark:hover:text-gray-300">Careers</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white dark:hover:text-gray-300">Blog</a></li>
            </ul>
          </div>
          
          {/* ... other footer sections ... */}
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white dark:hover:text-gray-300">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14C2.24 0 1 1.24 1 2.76v18.48C1 22.76 2.24 24 4 24h16c1.76 0 3-1.24 3-2.76V2.76C23 .24 21.76 0 19 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.53a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm15.11 12.92h-3.54v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.67h-3.54V9h3.4v1.56h.05c.47-.89 1.6-1.83 3.3-1.83 3.53 0 4.18 2.32 4.18 5.34v6.38z"/>
                    </svg>
                </a>
               <a href="#" className="text-gray-400 hover:text-white dark:hover:text-gray-300">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9zm4.25-3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
                    </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white dark:hover:text-gray-300">
                    <span className="sr-only">TikTok</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.75 2h3.18a4.5 4.5 0 0 0 3.57 3.57v3.18a7.5 7.5 0 0 1-3.75-1.02v6.77a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V2z"/>
                    </svg>
                </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 dark:border-gray-600 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}