import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';

const routes: Routes = [
  { path: 'productos', component: ProductListComponent },
  { path: 'agregar', component: ProductFormComponent },
  { path: 'editar', component: ProductFormComponent },
  { path: '**', redirectTo: 'productos' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
