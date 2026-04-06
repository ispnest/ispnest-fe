import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDivider, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatSlider, MatSliderRangeThumb } from '@angular/material/slider';
import { Media } from '@/app/core/media';
import { BuiCollapsible, BuiCollapsibleContent, BuiCollapsiblePanel, BuiCollapsibleTrigger } from '@/app/ui/collapsible';
import { BuiSidebar, BuiSidebarAction, BuiSidebarBody, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarPanelFiltering',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatSelectionList, MatListOption, MatChipListbox, MatChipOption, MatFormField, MatInput, MatPrefix, MatSlider, MatSliderRangeThumb, FormsModule, MatLabel, BuiSidebar, BuiSidebarBody, BuiSidebarSection, BuiCollapsible, BuiSidebarSectionHeader, BuiCollapsibleTrigger, BuiSidebarLabel, BuiSidebarIcon, BuiSidebarSectionContent, BuiCollapsibleContent, BuiCollapsiblePanel, BuiSidebarAction],
  template: `
    <div class="flex flex-auto flex-col">
      <!-- Toolbar -->
      <div class="flex items-center gap-x-4 border-b p-4">
        <button matIconButton (click)="sidenav.toggle()">
          <mat-icon svgIcon="panel-left" />
        </button>
      </div>

      <mat-sidenav-container>
        <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
          <!-- Sidebar -->
          <aside buiSidebar>
            <!-- Body -->
            <div buiSidebarBody class="pt-3">
              <div buiSidebarSection buiCollapsible [expanded]="true">
                <div buiSidebarSectionHeader>
                  <button buiSidebarAction buiCollapsibleTrigger>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                  <span buiSidebarLabel>Categories</span>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiSidebarSectionContent buiCollapsibleContent class="p-2">
                    <mat-chip-listbox [multiple]="true">
                      <mat-chip-option>Clothes</mat-chip-option>
                      <mat-chip-option>Shoes</mat-chip-option>
                      <mat-chip-option>Bags</mat-chip-option>
                      <mat-chip-option>Jewelry</mat-chip-option>
                      <mat-chip-option>Accessories</mat-chip-option>
                      <mat-chip-option>Electronics</mat-chip-option>
                      <mat-chip-option>Furniture</mat-chip-option>
                    </mat-chip-listbox>
                  </div>
                </ng-template>
              </div>

              <mat-divider class="mx-4" />

              <div buiSidebarSection buiCollapsible [expanded]="true">
                <div buiSidebarSectionHeader>
                  <button buiSidebarAction buiCollapsibleTrigger>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                  <span buiSidebarLabel>Brands</span>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiSidebarSectionContent buiCollapsibleContent>
                    <mat-form-field class="px-2 pt-2">
                      <mat-icon svgIcon="search" matIconPrefix />
                      <input matInput placeholder="Search brands" />
                    </mat-form-field>

                    <div class="mt-2 h-full max-h-44 overflow-auto">
                      <mat-selection-list multiple>
                        <mat-list-option togglePosition="before">Luminexio</mat-list-option>
                        <mat-list-option togglePosition="before">Aperture Lane</mat-list-option>
                        <mat-list-option togglePosition="before">NovaForge</mat-list-option>
                        <mat-list-option togglePosition="before">Solvanta</mat-list-option>
                        <mat-list-option togglePosition="before">Driftline Labs</mat-list-option>
                        <mat-list-option togglePosition="before">VeraCircuit</mat-list-option>
                        <mat-list-option togglePosition="before">Miravia</mat-list-option>
                        <mat-list-option togglePosition="before">Karosoft Studio</mat-list-option>
                        <mat-list-option togglePosition="before">Astryl Systems</mat-list-option>
                        <mat-list-option togglePosition="before">Pulseframe</mat-list-option>
                      </mat-selection-list>
                    </div>
                  </div>
                </ng-template>
              </div>

              <mat-divider class="mx-4" />

              <div buiSidebarSection buiCollapsible [expanded]="true">
                <div buiSidebarSectionHeader>
                  <button buiSidebarAction buiCollapsibleTrigger>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                  <span buiSidebarLabel>Price</span>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiSidebarSectionContent buiCollapsibleContent>
                    <div class="flex items-center gap-x-2 px-2 pt-2">
                      <mat-form-field>
                        <mat-label>From</mat-label>
                        <span matPrefix>$</span>
                        <input matInput [(ngModel)]="minPrice" [min]="0" [max]="1000" />
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>To</mat-label>
                        <span matPrefix>$</span>
                        <input matInput [(ngModel)]="maxPrice" [min]="0" [max]="1000" />
                      </mat-form-field>
                    </div>

                    <mat-slider [min]="0" [max]="1000">
                      <input matSliderStartThumb [(value)]="minPrice" />
                      <input matSliderEndThumb [(value)]="maxPrice" />
                    </mat-slider>
                  </div>
                </ng-template>
              </div>

              <mat-divider class="mx-4" />

              <div buiSidebarSection buiCollapsible>
                <div buiSidebarSectionHeader>
                  <button buiSidebarAction buiCollapsibleTrigger>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                  <span buiSidebarLabel>Availability</span>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiSidebarSectionContent buiCollapsibleContent>
                    <div class="mt-2">
                      <mat-selection-list multiple>
                        <mat-list-option togglePosition="before" selected>In Stock</mat-list-option>
                        <mat-list-option togglePosition="before">Out of Stock</mat-list-option>
                        <mat-list-option togglePosition="before">Pre-order</mat-list-option>
                      </mat-selection-list>
                    </div>
                  </div>
                </ng-template>
              </div>
            </div>
          </aside>
        </mat-sidenav>

        <mat-sidenav-content>
          <!-- Content -->
          <div class="flex flex-auto p-6">
            <div class="flex-auto rounded-md border-2 border-dashed p-4"></div>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
})
export class SidebarPanelFiltering {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
  protected readonly minPrice = signal(200);
  protected readonly maxPrice = signal(650);
}
