from odoo import models, fields, api
from datetime import date

class StudentStudent(models.Model):
    _name = 'student.student'
    _description = 'Student Information'

    name = fields.Char(string='Name', required=True)
    dob = fields.Date(string='Date of Birth')
    age = fields.Integer(string='Age', compute='_compute_age', store=True)
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ], string='Gender', default='male')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    address = fields.Text(string='Address')
    admission_date = fields.Date(string='Admission Date', default=fields.Date.context_today)
    active = fields.Boolean(string='Active', default=True)

    @api.depends('dob')
    def _compute_age(self):
        for record in self:
            age = 0
            if record.dob:
                today = date.today()
                dob = record.dob
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            record.age = age

    def action_greet_js(self):
        return True

    def action_greet_python(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Python Greeting',
                'message': f'Hello {self.name}! (From Python)',
                'type': 'success',
                'sticky': False,
            }
        }
