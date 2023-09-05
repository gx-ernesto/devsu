import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product';

enum Page {
  prev = 'prev',
  next = 'next',
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  host: { 'class': 'centered-container' },
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  paged: Product[] = [];
  search: string = '';
  openMenu: number = -1;
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll()
    .pipe(take(1)).subscribe(products => {
      this.products = products;
      this.onSearch();
    });
  }

  onSearch() {
    const search = this.search.toLowerCase();
    this.filtered = this.products.filter(({ name, description }) =>
      name.toLowerCase().includes(search) || description.toLowerCase().includes(search)
    );
    this.onItemsPerPageChange();
  }

  onItemsPerPageChange() {
    this.totalPages = Math.ceil(this.filtered.length / this.itemsPerPage) || 1;
    const page = this.currentPage > this.totalPages ? this.totalPages : this.currentPage;
    this.goToPage(page);
  }

  goToPage(page: Page | string | number) {
    if (page === Page.prev && this.currentPage > 1)
      page = this.currentPage - 1;
    else if (page === Page.next && this.currentPage < this.totalPages)
      page = this.currentPage + 1;
      
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      const start = (page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paged = this.filtered.slice(start, end);
    }
  }

  onAdd() {
    this.router.navigate(['agregar']);
  }

  onEdit(product: Product) {
    this.router.navigate(['editar'], { state: product });
  }

  onDelete(id: string) {
    this.productService.delete(id)
    .pipe(take(1)).subscribe(() => this.loadProducts());
  }

  toggleMenu(index: number) {
    this.openMenu = this.openMenu === index ? -1 : index;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: PointerEvent) {
    const outsideTrigger = !(event.target as HTMLElement).closest('.dropdown .trigger');
    if (outsideTrigger) this.openMenu = -1;
  }

}
