import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Globe } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-steel-400 hover:text-copper-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article className="prose prose-invert prose-copper max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Impressum / Legal Notice
          </h1>

          <section className="bg-steel-800/50 border border-steel-700 rounded-xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 mt-0">
              Website Information
            </h2>
            <p className="text-steel-300 mb-4">
              This is a <strong className="text-copper-400">private, non-commercial website</strong> dedicated
              to sharing technical knowledge, experiments, and projects related to 3D printing,
              engineering, and technology.
            </p>
            <p className="text-steel-300">
              All content on this website is provided for informational and educational purposes only.
              No commercial transactions take place on this website.
            </p>
          </section>

          <section className="bg-steel-800/50 border border-steel-700 rounded-xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 mt-0">
              Responsible for Content
            </h2>
            <div className="text-steel-300 space-y-2">
              <p className="font-medium text-white">GM-TC</p>
              <p>Private Technical Blog</p>
              <p className="flex items-center gap-2 mt-4">
                <Globe className="w-4 h-4 text-copper-400" />
                <a href="https://gm-tc.tech" className="text-copper-400 hover:text-copper-300">
                  gm-tc.tech
                </a>
              </p>
            </div>
          </section>

          <section className="bg-steel-800/50 border border-steel-700 rounded-xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 mt-0">
              Contact
            </h2>
            <p className="text-steel-300 mb-4">
              For inquiries, feedback, or questions about the content on this website:
            </p>
            <a
              href="mailto:info@gm-tc.tech"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copper-400/10 text-copper-400 rounded-lg hover:bg-copper-400/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@gm-tc.tech
            </a>
          </section>

          <section className="bg-steel-800/50 border border-steel-700 rounded-xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 mt-0">
              Disclaimer
            </h2>
            <div className="text-steel-300 space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Content Accuracy</h3>
                <p>
                  While every effort is made to ensure the accuracy of the information presented,
                  no guarantee can be given. The content represents personal experiences, experiments,
                  and opinions. Use any information at your own risk.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">External Links</h3>
                <p>
                  This website may contain links to external websites. We have no control over the
                  content of these websites and cannot accept responsibility for their content.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Copyright</h3>
                <p>
                  Unless otherwise stated, all content on this website (text, images, charts, data)
                  is the intellectual property of the website owner. Reproduction or use requires
                  explicit permission.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-steel-800/50 border border-steel-700 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-4 mt-0">
              Privacy
            </h2>
            <p className="text-steel-300">
              This website does not collect personal data beyond what is technically necessary
              for the operation of the website. No tracking cookies, analytics, or third-party
              services that collect user data are used.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}

