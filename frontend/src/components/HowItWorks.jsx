const steps = [
  {
    name: 'Create your profile',
    description: 'Tell us about your subjects, availability, and learning preferences.',
    number: '1',
  },
  {
    name: 'Find matches',
    description: 'Our algorithm suggests compatible study partners based on your profile.',
    number: '2',
  },
  {
    name: 'Start studying',
    description: 'Connect with your match and schedule your first study session.',
    number: '3',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 dark:text-primary-500 font-semibold tracking-wide uppercase">
            Process
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            How StudyBuddy works
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {steps.map((step) => (
              <div key={step.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-200 font-bold text-xl">
                  {step.number}
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {step.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
