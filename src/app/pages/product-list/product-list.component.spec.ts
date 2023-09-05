import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { ProductListComponent } from './product-list.component';

const fakeProducts: Product[] = [];
for (let i = 0; i < 10; i++)
  fakeProducts.push({
    id: `${i}`,
    name: `Producto ${i}`,
    description: `Descripcion ${i}`,
    logo: `logo${i}.png`,
    date_release: new Date(),
    date_revision: new Date(),
  });

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProductService', ['getAll', 'delete']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        ProductListComponent,
        { provide: ProductService, useValue: spy },
      ]
    });

    component = TestBed.inject(ProductListComponent);
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should load all products on init', () => {
    productServiceSpy.getAll.and.returnValue(of(fakeProducts));
    component.ngOnInit();
    expect(productServiceSpy.getAll.calls.count()).toBe(1);
    expect(component.products).toEqual(fakeProducts);
  });

  it('should allow to search the products', () => {
    component.products = fakeProducts;
    component.search = 'Descripcion';
    component.onSearch();
    expect(component.filtered).toEqual(fakeProducts);
  });

  it('should go to the last page when currentPage > totalPages', () => {
    component.currentPage = 10;
    component.onItemsPerPageChange();
    expect(component.currentPage).toBe(1);
  });

  it('should go to previous page', () => {
    component.totalPages = 5
    component.currentPage = 2;
    component.goToPage('prev');
    expect(component.currentPage).toBe(1);
  });

  it('should go to the next page', () => {
    component.totalPages = 5
    component.currentPage = 3;
    component.goToPage('next');
    expect(component.currentPage).toBe(4);
  });

  it('should navigate to form on add', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onAdd();
    expect(navigateSpy).toHaveBeenCalledWith(['agregar']);
  });

  it('should navigate to form on edit', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onEdit(fakeProducts[0]);
    expect(navigateSpy).toHaveBeenCalledWith(['editar'], { state: fakeProducts[0] });
  });

  it('should delete a product and reload', () => {
    productServiceSpy.delete.and.returnValue(of({}));
    productServiceSpy.getAll.and.returnValue(of(fakeProducts));
    component.onDelete('trj');
    expect(productServiceSpy.delete.calls.count()).toBe(1);
    expect(productServiceSpy.getAll.calls.count()).toBe(1);
  });

  it('should toggle a menu open / closed', () => {
    component.toggleMenu(3);
    expect(component.openMenu === 3).toBeTrue();
    component.toggleMenu(3);
    expect(component.openMenu === -1).toBeTrue();
    component.toggleMenu(3);
    expect(component.openMenu === 3).toBeTrue();
  });

  it('should close any menu on click outside trigger', () => {
    const mockEvent = { target: { closest: () => null } };
    component.onClick(mockEvent as unknown as PointerEvent);
    expect(component.openMenu === -1).toBeTrue();
  });

});
