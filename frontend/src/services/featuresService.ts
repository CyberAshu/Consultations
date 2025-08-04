import { apiGet, apiPost } from './api';
import { 
  Testimonial,
  FAQ,
  Service 
} from './types';

class FeaturesService {
  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return apiGet<Testimonial[]>('/features/testimonials');
  }

  async createTestimonial(testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    return apiPost<Testimonial>('/features/testimonials', testimonialData);
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    return apiGet<FAQ[]>('/features/faqs');
  }

  async getHomeFAQs(): Promise<FAQ[]> {
    return apiGet<FAQ[]>('/features/home-faqs');
  }

  async createFAQ(faqData: Partial<FAQ>): Promise<FAQ> {
    return apiPost<FAQ>('/features/faqs', faqData);
  }

  // Services
  async getServices(): Promise<Service[]> {
    return apiGet<Service[]>('/features/services');
  }

  async createService(serviceData: Partial<Service>): Promise<Service> {
    return apiPost<Service>('/features/services', serviceData);
  }
}

export const featuresService = new FeaturesService();
