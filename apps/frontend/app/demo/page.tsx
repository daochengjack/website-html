'use client';

import { useState } from 'react';

import Breadcrumb from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import Pagination from '@/components/ui/pagination';

export default function DemoPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbItems = [{ label: 'Demo', href: '/demo' }];

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb Demo */}
      <section>
        <Breadcrumb items={breadcrumbItems} />
      </section>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Component Demo Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates the various UI components and layout features.
        </p>
      </div>

      {/* Button Variants Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      {/* Button Sizes Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>
      </section>

      {/* Card Components Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ceramic Coating</CardTitle>
              <CardDescription>Premium nano-ceramic protection for your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Learn More</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paint Protection Film</CardTitle>
              <CardDescription>
                Self-healing clear bra for ultimate paint protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Window Tinting</CardTitle>
              <CardDescription>Professional window films for UV protection</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Get Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loading Component Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Small Loader</h3>
            <Loading size="sm" text="Loading..." />
          </div>
          <div className="text-center space-y-4">
            <h3 className="font-medium">Medium Loader</h3>
            <Loading size="md" text="Processing..." />
          </div>
          <div className="text-center space-y-4">
            <h3 className="font-medium">Large Loader</h3>
            <Loading size="lg" text="Please wait..." />
          </div>
        </div>
      </section>

      {/* Pagination Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Pagination Component</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Current page: {currentPage} (simulated loading state: {isLoading ? 'true' : 'false'})
          </p>
          {isLoading ? (
            <Loading text="Loading page..." />
          ) : (
            <Pagination currentPage={currentPage} totalPages={10} onPageChange={handlePageChange} />
          )}
        </div>
      </section>

      {/* Interactive Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Interactive Elements</h2>
        <Card>
          <CardHeader>
            <CardTitle>Test Navigation</CardTitle>
            <CardDescription>
              Try the responsive navigation by resizing your browser window
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={() => alert('Desktop menu should show Services dropdown')}>
                Test Desktop Menu
              </Button>
              <Button onClick={() => alert('Try resizing to mobile width and click menu button')}>
                Test Mobile Menu
              </Button>
              <Button variant="outline" onClick={() => alert('Search toggle should appear')}>
                Test Search Function
              </Button>
              <Button variant="outline" onClick={() => alert('Language switcher in top bar')}>
                Test Language Switcher
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
