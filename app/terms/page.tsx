import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/register">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using the Health Insurance Portal ("Service"), you accept and agree to be bound by
                  the terms and provision of this agreement. If you do not agree to abide by the above, please do not
                  use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Health Insurance Portal provides a comprehensive platform for managing health insurance policies,
                  claims, provider networks, and health analytics. Our services include but are not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Policy management and coverage information</li>
                  <li>Claims submission and tracking</li>
                  <li>Healthcare provider directory and appointment booking</li>
                  <li>Health analytics and predictive insights</li>
                  <li>Secure communication with healthcare providers and insurers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-700 leading-relaxed">
                  To access certain features of our Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to protecting your privacy and personal health information. Our collection, use, and
                  disclosure of personal information is governed by our Privacy Policy, which is incorporated into these
                  Terms by reference. We comply with applicable healthcare privacy laws, including HIPAA where
                  applicable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
                <p className="text-gray-700 leading-relaxed">You agree not to use the Service to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Submit false or fraudulent claims or information</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service for any commercial purpose without authorization</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Health Information Disclaimer</h2>
                <p className="text-gray-700 leading-relaxed">
                  The information provided through our Service is for informational purposes only and should not be
                  considered as medical advice. Always consult with qualified healthcare professionals for medical
                  decisions. We do not provide medical services or practice medicine.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
                  indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain high availability of our Service, but we do not guarantee uninterrupted access.
                  We may temporarily suspend the Service for maintenance, updates, or other operational reasons with
                  reasonable notice when possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Modifications to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes
                  via email or through the Service. Continued use of the Service after such modifications constitutes
                  acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice,
                  for conduct that we believe violates these Terms or is harmful to other users, us, or third parties,
                  or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="mt-2 text-gray-700">
                  <p>Email: legal@healthinsuranceportal.com</p>
                  <p>Phone: 1-800-HEALTH-1</p>
                  <p>Address: 123 Healthcare Ave, Medical City, HC 12345</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
