import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParadasPage } from './paradas.page';

describe('ParadasPage', () => {
  let component: ParadasPage;
  let fixture: ComponentFixture<ParadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
