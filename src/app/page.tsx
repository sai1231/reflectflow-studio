import { ReflectFlowOverlay } from "@/components/reflect-flow/ReflectFlowOverlay";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Mock page content below the overlay */}
      <div className="container mx-auto px-4 py-8 relative z-0">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold font-headline mb-4 text-primary">Welcome to MockPage</h1>
          <p className="text-xl text-foreground/80">
            This is a sample page content to demonstrate the ReflectFlow overlay.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8 mb-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold font-headline mb-4">Interactive Elements</h2>
            <p className="mb-4 text-foreground/70">
              Try using ReflectFlow to record interactions with the elements on this page (simulation).
            </p>
            <form className="space-y-4 p-6 bg-card rounded-lg shadow-md">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <Input type="text" id="name" name="name" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <Input type="email" id="email" name="email" placeholder="john.doe@example.com" />
              </div>
              <Button type="submit" variant="default" className="w-full">Submit Form</Button>
            </form>
          </div>
          <div className="flex justify-center">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Placeholder image for web application" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-xl object-cover"
              data-ai-hint="web application"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold font-headline mb-6 text-center">Feature Highlights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Easy Recording", description: "Capture browser actions effortlessly.", dataAiHint: "user interface" },
              { title: "Step Editing", description: "Modify recorded steps as needed.", dataAiHint: "code editor" },
              { title: "Selective Playback", description: "Replay specific parts of your flow.", dataAiHint: "media player" }
            ].map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image 
                    src={`https://placehold.co/300x200.png`} 
                    alt={feature.title} 
                    width={300} 
                    height={200} 
                    className="rounded-md mb-4 object-cover w-full"
                    data-ai-hint={feature.dataAiHint}
                  />
                  <p className="text-foreground/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <footer className="text-center mt-16 py-8 border-t">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MockPage Inc. All rights reserved.</p>
        </footer>
      </div>

      {/* ReflectFlow Overlay */}
      <ReflectFlowOverlay />
    </main>
  );
}

// Dummy Input and Button components for the mock page content
// These are not part of ReflectFlow but help build the example page
function Input({ ...props }) {
  return <input {...props} className="block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground placeholder:text-muted-foreground" />;
}

function Button({ children, ...props } : {children: React.ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement> ) {
  return <button {...props} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">{children}</button>;
}

function Card({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props} className="flex flex-col space-y-1.5 p-6">{children}</div>;
}

function CardTitle({ children, className, ...props }: { children: React.ReactNode, className?: string }) {
  return <h3 {...props} className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function CardContent({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props} className="p-6 pt-0">{children}</div>;
}

