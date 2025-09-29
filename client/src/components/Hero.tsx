import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import heroImg from "@assets/generated_images/Professional_Caucasian_man_executive_584fa5c3.png";

export function Hero() {
  const [, setLocation] = useLocation();
  
  const handleCTAClick = () => {
    setLocation("/wizard");
  };

  return (
    <section className="relative min-h-screen bg-blue-600 flex items-center justify-center px-4">
      {/* Background texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,.1) 10px,
            rgba(255,255,255,.1) 20px
          )`
        }}
      />
      
      {/* Main white card */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header section */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-blue-600 font-semibold">Host</span>
              <span className="text-gray-600 font-medium">careres</span>
              <span className="text-gray-600 font-medium">Professional CV</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-blue-600 font-medium">#0A74DA</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Booostet carers with professional CVs
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Fontid yosty lonyfoe yetency tecinggsonenration; ande seost coobi eo foulbooing.
              </p>
              
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full"
                onClick={handleCTAClick}
              >
                Call-to Action
              </Button>
            </div>

            {/* Right side - Hero image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={heroImg}
                  alt="Professional executive"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Arrow indicator */}
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {/* CV Templates */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">CV Templates</h3>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600">CV ternlaks</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600">Padden Featurs</span>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Applications</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Tablet Interface</span>
              </div>
            </div>

            {/* Applications (variant) */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Applicattions</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Laptop Interface</span>
              </div>
            </div>

            {/* Testimonials */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tortentatints</h3>
              <div className="flex justify-center gap-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pb-8">
            <span className="text-gray-500 text-sm">Bokratinations</span>
          </div>
        </div>
      </div>

      {/* Blue corner indicator */}
      <div className="absolute top-8 right-8 text-white font-bold text-lg">
        #64.169
      </div>
    </section>
  );
}