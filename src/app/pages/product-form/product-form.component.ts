import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { Observable, take, debounceTime, map } from 'rxjs';

import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product';

type SaveAction = keyof Pick<ProductService, 'create' | 'update'>;
const formatDate = (date: Date | string): string => (new Date(date)).toISOString().substring(0, 10);
const validationErrors: { [key: string]: string } = {
  required: 'El campo {name} es requerido!',
  minlength: 'La longitud mínima del campo {name} es {length}!',
  maxlength: 'La longitud máxima del campo {name} es {length}!',
  exists: 'El {name} no es válido!',
};

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  host: { 'class': 'centered-container' },
})
export class ProductFormComponent {
  isEdit: boolean = false;
  form: FormGroup = new FormGroup({});
  get today(): string { return formatDate(new Date()); }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
  ) {
    this.isEdit = router.url == '/editar';
    const navigation = this.router.getCurrentNavigation();
    const data: Product = navigation?.extras.state as Product;
    this.initForm(data);
  }

  initForm(data: Product) {
    const release = data?.date_release ? formatDate(data.date_release) : null;
    const revision = data?.date_revision ? formatDate(data.date_revision) : null;

    this.form = this.fb.group({
      id: [{ value: data?.id, disabled: this.isEdit }, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ], this.validateId],
      name: [data?.name, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]],
      description: [data?.description, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]],
      logo: [data?.logo, Validators.required],
      date_release: [release, Validators.required],
      date_revision: [{ value: revision, disabled: true }, Validators.required],
    });

    this.form.get('date_release')?.valueChanges.subscribe((value) => {
      const release = new Date(value);
      release.setFullYear(release.getFullYear() + 1);
      this.form.get('date_revision')?.setValue(formatDate(release));
    });
  }

  validateId = (control: AbstractControl): Observable<ValidationErrors | null> => {
    return this.productService.idExists(control.value)
    .pipe(
      debounceTime(300),
      map(exists => exists ? { exists } : null)
    )
  }

  isInvalid(id: string): boolean {
    const control = this.form.get(id);
    return (control?.invalid && control?.dirty) ?? true
  }

  getErrors(id: string, name: string): string[] {
    const errors = Object.entries(this.form.get(id)?.errors ?? {});
    return errors.map(([error, value]) => {
      let message = validationErrors[error];
      message = message.replace('{name}', name);
      if (value?.requiredLength)
        message = message.replace('{length}', value.requiredLength);
      return message;
    });
  }

  onSubmit(event?: Event) {
    event?.preventDefault();

    const data: Product = this.form.getRawValue();
    const action: SaveAction = this.isEdit ? 'update' : 'create';

    this.productService[action](data)
    .pipe(take(1)).subscribe(result => {
      if (result?.id) this.router.navigate(['productos']);
    });
  }

}
