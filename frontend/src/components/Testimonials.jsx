const testimonials = [
  {
    quote: "StudyBuddy helped me find the perfect partner for my computer science courses. We've been studying together for 3 months now!",
    name: "Alex Johnson",
    role: "Computer Science Student",
  },
  {
    quote: "I was struggling with calculus until I matched with someone who explained concepts in a way I finally understood.",
    name: "Maria Garcia",
    role: "Engineering Student",
  },
  {
    quote: "The virtual study rooms are amazing. It feels like we're in the library together even though we're miles apart.",
    name: "Jamal Williams",
    role: "Pre-Med Student",
  },
]

export default function Testimonials() {
  return (
    <section className="bg-primary-50 dark:bg-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary-500 dark:text-primary-500 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            What students are saying
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
              <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4">"{testimonial.quote}"</blockquote>
              <div className="text-primary-600 dark:text-primary-400 font-medium">{testimonial.name}</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}