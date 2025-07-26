const features = [
  {
    name: 'Smart Matching',
    description: 'Our algorithm pairs you with compatible study partners based on your subjects, schedule, and learning preferences.',
    image: '/3b2315d4-a133-4750-98af-242c41b8b390.png',
  },
  {
    name: 'AI-Powered Study Suite',
    description: 'Access our AI Tutor for explanations, AI Scheduler for planning, and AI Researcher for instant topic insights - all designed to supercharge your learning.',
    image: '/sb-study.png',
  },
  {
    name: 'Progress Tracking',
    description: 'Set goals and track your study progress with your partner.',
    image: '/sb_gamer.png',
  },
]

export default function Features() {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 dark:text-primary-500 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Study better together
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-transparent dark:transparent">
                  <img 
                    src={feature.image} 
                    alt={feature.name}
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}