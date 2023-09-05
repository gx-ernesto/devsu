import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { ProductFormComponent } from './product-form.component';

const fakeProduct: Product = { id: 'tr', name: 'Tarjeta', description: 'Credito', logo: 'logo.png', date_release: new Date(), date_revision: new Date() };

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProductService', ['idExists', 'create', 'update']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        ProductFormComponent,
        { provide: ProductService, useValue: spy },
        FormBuilder
      ],
    });

    component = TestBed.inject(ProductFormComponent);
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should return current date', () => {
    const currentDate = (new Date()).toISOString().substring(0, 10);
    expect(component.today).toBe(currentDate);
  });

  it('should init the form with data', () => {
    component.initForm(fakeProduct);
    const clone = { ...fakeProduct } as { [key:string]: any };
    clone['date_release'] = (clone['date_release'] as Date).toISOString().substring(0, 10);
    clone['date_revision'] = (clone['date_revision'] as Date).toISOString().substring(0, 10);
    const formValue = component.form.getRawValue();
    expect(formValue).toEqual(clone);
  });

  it('should set date_revision to one year after date_release', () => {
    component.form.get('date_release')?.setValue('2023-9-4');
    expect(component.form.get('date_revision')?.value).toBe('2024-09-04');
  });

  it('should validate an ID with the server', () => {
    productServiceSpy.idExists.and.returnValue(of(false));
    const control = component.form.get('id');
    control?.setValue('trj-crd');
    component.validateId(control!).subscribe(errors => {
      expect(errors).toBeNull();
    });
  });

  it('should produce error for invalid ID from server', () => {
    productServiceSpy.idExists.and.returnValue(of(true));
    const control = component.form.get('id');
    control?.setValue('trj');
    component.validateId(control!).subscribe(errors => {
      expect(errors).toEqual({ exists: true });
    });
  });

  it('should check if a field is invalid', () => {
    const control = component.form.get('name');
    control?.setValue('');
    control?.markAsDirty();
    expect(component.isInvalid('name')).toBeTrue();
  });

  it('should isInvalid is true if control not found', () => {
    expect(component.isInvalid('null')).toBeTrue();
  });

  it('should return error messages for invalid field', () => {
    const errors = ['La longitud mínima del campo Descripcion es 10!']
    const control = component.form.get('description');
    control?.setValue('asd');
    control?.markAsDirty();
    expect(component.getErrors('description', 'Descripcion')).toEqual(errors);
  });

  it('should return no error messages fo valid field', () => {
    const control = component.form.get('description');
    control?.setValue('Tarjeta credito');
    control?.markAsDirty();
    expect(component.getErrors('description', 'Descripcion')).toEqual([]);
  });

  it('should submit with create', () => {
    const navigateSpy = spyOn(router, 'navigate');
    productServiceSpy.create.and.returnValue(of(fakeProduct));
    component.onSubmit();
    expect(productServiceSpy.create.calls.count()).toBe(1);
    expect(navigateSpy).toHaveBeenCalledWith(['productos']);
  });

  it('should submit with update when editing', () => {
    const navigateSpy = spyOn(router, 'navigate');
    productServiceSpy.update.and.returnValue(of(fakeProduct));
    component.isEdit = true;
    component.onSubmit();
    expect(productServiceSpy.update.calls.count()).toBe(1);
    expect(navigateSpy).toHaveBeenCalledWith(['productos']);
  });

});
