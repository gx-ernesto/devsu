import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from 'src/environments/environment';
import { ProductService } from './product.service';
import { Product } from '../models/product';

const PRODUCTS_URL = environment.BASE_URL + '/bp/products';
const VERIFICATION_URL = PRODUCTS_URL + '/verification';
const fakeProduct = { id: 'trj-crd', name: 'Tarjeta', description: 'Credito', logo: 'logo.png', date_release: new Date(), date_revision: new Date() };

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all products', () => {
    const fakeProducts: Product[] = [fakeProduct];

    service.getAll().subscribe((products) => {
      expect(products).toEqual(fakeProducts);
    })

    const req = httpTestingController.expectOne(PRODUCTS_URL);
    expect(req.request.method).toEqual('GET');
    req.flush(fakeProducts);
  });

  it('should check if ID exists', () => {
    const id = fakeProduct.id;

    service.idExists(id).subscribe((exists) => {
      expect(exists).toBeTrue();
    });

    const req = httpTestingController.expectOne(`${VERIFICATION_URL}?id=${id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(true);
  });

  it('should create a product', () => {    
    service.create(fakeProduct).subscribe((product) => {
      expect(product).toEqual(fakeProduct);
    });

    const req = httpTestingController.expectOne(PRODUCTS_URL);
    expect(req.request.method).toEqual('POST');
    req.flush(fakeProduct);
  });

  it('should update a product', () => {    
    service.update(fakeProduct).subscribe((product) => {
      expect(product).toEqual(fakeProduct);
    });

    const req = httpTestingController.expectOne(PRODUCTS_URL);
    expect(req.request.method).toEqual('PUT');
    req.flush(fakeProduct);
  });

  it('should delete a product by ID', () => {
    const id = fakeProduct.id;
  
    service.delete(id).subscribe(() => {});
  
    const req = httpTestingController.expectOne(`${PRODUCTS_URL}?id=${id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });

});
