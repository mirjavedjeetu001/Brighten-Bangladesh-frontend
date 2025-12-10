export const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Brighten Bangladesh</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Mission</h2>
            <p>
              Brighten Bangladesh is dedicated to empowering communities across Bangladesh through
              education, collaboration, and positive social change. We believe that by bringing
              together passionate individuals, we can create lasting impact and build a brighter
              future for all.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Do</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Community Building:</strong> Connect like-minded individuals working
                towards positive change
              </li>
              <li>
                <strong>Knowledge Sharing:</strong> Platform for sharing experiences, stories, and
                best practices
              </li>
              <li>
                <strong>Project Collaboration:</strong> Facilitate collaborative projects and
                initiatives
              </li>
              <li>
                <strong>Skill Development:</strong> Provide opportunities for learning and growth
              </li>
              <li>
                <strong>Recognition:</strong> Acknowledge and celebrate contributions through our
                membership program
              </li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Collaboration</h3>
                <p>We believe in the power of working together to achieve common goals.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Integrity</h3>
                <p>We uphold the highest standards of honesty and ethical behavior.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Excellence</h3>
                <p>We strive for excellence in everything we do.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Impact</h3>
                <p>We focus on creating measurable, positive change in communities.</p>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Membership Benefits</h2>
            <p className="mb-4">
              Active members who contribute regularly to our platform through blogs, events, and
              projects can earn exclusive membership benefits:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Official Brighten Bangladesh membership card</li>
              <li>Recognition in our community</li>
              <li>Priority access to events and workshops</li>
              <li>Networking opportunities with like-minded individuals</li>
              <li>Featured profile on our platform</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">How to Become a Member</h2>
            <p className="mb-4">Earn your membership by actively participating in our community:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Write and publish 4-5 approved blogs per month</li>
              <li>Participate in at least 1 community event every 3 months</li>
              <li>Contribute to 1 project every 6 months</li>
            </ol>
            <p className="mt-4">
              Meeting these criteria makes you eligible for official membership status with all its
              benefits!
            </p>
          </section>

          <section className="card bg-primary-50">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Join Us Today</h2>
            <p>
              Ready to be part of something bigger? Register now and start making a difference in
              your community. Together, we can brighten Bangladesh!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
