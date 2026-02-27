/** @odoo-module **/

import { FormController } from "@web/views/form/form_controller";
import { formView } from "@web/views/form/form_view";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

class StudentFormController extends FormController {
    setup() {
        super.setup();
        this.notification = useService("notification");
        console.log("StudentFormController Setup - js_class is working!");
    }

    async beforeExecuteActionButton(clickParams) {
        console.log("Button Clicked (beforeExecuteActionButton):", clickParams.name);

        if (clickParams.name === "action_greet_js") {
            const name = this.model.root.data.name || "Student";
            this.notification.add(`Hello ${name}! This is from the Odoo 17 JS Controller.`, {
                title: "JS Success",
                type: "success",
                sticky: false,
            });
            // Return false to prevent the Python method from being called
            return false;
        }
        return super.beforeExecuteActionButton(clickParams);
    }
}

export const studentFormView = {
    ...formView,
    Controller: StudentFormController,
};

registry.category("views").add("student_form_greet", studentFormView);
