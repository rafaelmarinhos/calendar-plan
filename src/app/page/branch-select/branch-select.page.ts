import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../../service/auth.service';
import { callback } from '../calendar-plan-list/calendar-plan-list.page';
import { Branch } from '../../model/branch';

@Component({
  selector: 'app-branch-select',
  templateUrl: './branch-select.page.html',
  styleUrls: ['./branch-select.page.scss'],
})
export class BranchSelectPage implements OnInit {

  selectedBranches: Branch[];
  items: Observable<any[]>;

  constructor(
    private modalCtrl: ModalController,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.items = afs.collection('branch',
      q => q.where('permissions', 'array-contains', { email: this.authService.getAuthInfo().email, role: 'manager' })
    ).snapshotChanges(['added', 'removed']).pipe(callback);
  }

  ngOnInit() {
    this.selectedBranches = [];
  }

  dismiss(proceed) {
    if (proceed) {
      this.modalCtrl.dismiss({
        selectedBranches: this.selectedBranches,
      });
    } else {
      this.modalCtrl.dismiss();
    }
  }

  updateSelected(e, branch) {
    if (!this.selectedBranches.includes(branch) && e.target.checked) {
      this.selectedBranches.push(branch);
    } else if (!e.target.checked) {
      this.selectedBranches.splice(this.selectedBranches.indexOf(branch), 1);
    }
  }
}
