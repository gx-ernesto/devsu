import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Product } from '../models/product';

const PRODUCTS_URL = environment.BASE_URL + '/bp/products';
const VERIFICATION_URL = PRODUCTS_URL + '/verification';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient,
  ) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(PRODUCTS_URL).pipe(retry(3));
  }

  idExists(id: string) {
    const options = { params: { id }};
    return this.http.get<boolean>(VERIFICATION_URL, options).pipe(retry(3));
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(PRODUCTS_URL, product).pipe(retry(3));
  }

  update(product: Product): Observable<Product> {
    return this.http.put<Product>(PRODUCTS_URL, product).pipe(retry(3));
  }

  delete(id: string): Observable<{ [key: string]: any }> {
    const options = { params: { id }};
    return this.http.delete<{ [key: string]: any }>(PRODUCTS_URL, options).pipe(retry(3));
  }

}
