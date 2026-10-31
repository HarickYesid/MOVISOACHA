import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMapaPage } from './admin-mapa.page';

describe('AdminMapaPage', () => {
  let component: AdminMapaPage;
  let fixture: ComponentFixture<AdminMapaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
